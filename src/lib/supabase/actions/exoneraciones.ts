'use server'

import { createClient, requireAuth } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getColombiaDateString } from '@/lib/date-utils'
import { logger } from '@/lib/logger'

export async function getExoneraciones() {
  const { supabase, activeGymId } = await requireAuth()
  
  if (!activeGymId) return []

  const { data, error } = await supabase
    .from('exoneraciones')
    .select('*')
    .eq('gimnasio_id', activeGymId)
    .order('creado_en', { ascending: false })
  
  if (error) {
    logger.error('Error fetching exoneraciones:', { error })
    return []
  }
  return data
}

export async function aplicarExoneracionGlobal(dias: number, descripcion: string) {
  const { supabase, activeGymId } = await requireAuth()
  
  if (!activeGymId) {
    return { success: false, error: 'No se pudo identificar el gimnasio activo.' }
  }

  // 1. Obtener todas las membresías activas del gimnasio actual
  const { data: membresias, error: fetchError } = await supabase
    .from('membresias')
    .select('id, fecha_fin')
    .eq('estado', 'activa')
    .eq('gimnasio_id', activeGymId)

  if (fetchError) {
    logger.error('Error fetching memberships:', { error: fetchError })
    return { success: false, error: 'Error interno del servidor' }
  }

  if (!membresias || membresias.length === 0) {
    return { success: false, error: 'No hay membresías activas para exonerar.' }
  }

  // 2. Actualizar cada membresía
  // Nota: Esto debería idealmente ser una función SQL en Supabase para ser atómico
  // Pero lo haremos así para asegurar compatibilidad sin migraciones manuales
  const updates = membresias.map(m => {
    const currentFin = new Date(m.fecha_fin)
    const newFin = new Date(currentFin)
    newFin.setDate(newFin.getDate() + dias)
    
    return supabase
      .from('membresias')
      .update({ fecha_fin: newFin.toISOString().split('T')[0] })
      .eq('id', m.id)
  })

  const results = await Promise.all(updates)
  const errors = results.filter(r => r.error)

  if (errors.length > 0) {
    logger.error('Some updates failed:', { errors })
    return { success: false, error: 'Algunas membresías no pudieron ser actualizadas.' }
  }

  // 3. Guardar el registro en el historial
  const { error: insertError } = await supabase.from('exoneraciones').insert([{
    fecha_cierre: getColombiaDateString(),
    descripcion,
    dias_compensados: dias,
    gimnasio_id: activeGymId
  }])

  if (insertError) {
    logger.error('Error saving exoneration record:', { error: insertError })
    // No bloqueamos el éxito porque las membresías ya se actualizaron
  }

  revalidatePath('/planes')
  revalidatePath('/clientes')
  revalidatePath('/asistencia')
  revalidatePath('/dashboard')
  
  return { success: true, count: membresias.length }
}
