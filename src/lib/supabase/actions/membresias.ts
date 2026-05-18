'use server'

import { createClient, requireAuth } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getColombiaDate, getColombiaISOString } from '@/lib/date-utils'
import { addDays, differenceInDays, format, parseISO } from 'date-fns'
import { logger } from '@/lib/logger'

export async function getHistorialAjustes(membresiaId: string) {
  const { supabase, activeGymId } = await requireAuth()
  if (!activeGymId) return []
  
  const { data, error } = await supabase
    .from('historial_ajustes_dias')
    .select(`
      *,
      perfiles:registrado_por (nombre),
      membresias!inner(clientes!inner(gimnasio_id))
    `)
    .eq('membresia_id', membresiaId)
    .eq('membresias.clientes.gimnasio_id', activeGymId)
    .order('created_at', { ascending: false })

  if (error) {
    logger.error('Error fetching adjustment history:', { error })
    return []
  }

  return data || []
}

export async function actualizarDiasMembresia(id: string, dias: number) {
  const { supabase, user, activeGymId } = await requireAuth()
  if (!activeGymId) return { success: false, error: 'Contexto de gimnasio no encontrado' }
  
  // 1. Obtener datos actuales antes de actualizar para el historial
  const { data: memData, error: fetchError } = await supabase
    .from('membresias')
    .select(`
      cliente_id, fecha_fin, estado, dias_congelados,
      clientes!inner(gimnasio_id)
    `)
    .eq('id', id)
    .eq('clientes.gimnasio_id', activeGymId)
    .single()

  if (fetchError || !memData) {
    logger.error('Error fetching membership data:', { error: fetchError })
    return { success: false, error: 'Membresía no encontrada' }
  }

  const hoy = getColombiaDate()
  hoy.setHours(0, 0, 0, 0)
  
  // Calcular días anteriores de forma consistente con getClienteById
  let diasAnteriores = 0
  if (memData?.estado === 'congelada') {
    diasAnteriores = memData.dias_congelados || 0
  } else if (memData?.fecha_fin) {
    try {
      const fechaFinActual = parseISO(memData.fecha_fin)
      diasAnteriores = Math.max(0, differenceInDays(fechaFinActual, hoy))
    } catch (e) {
      logger.error('Error calculating previous days:', { error: e })
    }
  }

  // 2. Actualizar la membresía
  let memError;
  
  if (memData?.estado === 'congelada') {
    const { error } = await supabase
      .from('membresias')
      .update({ 
        dias_congelados: dias,
        // Si manual lo ponen en 0, lo vencemos o lo dejamos inactivo? Mejor lo dejamos congelado con 0, o vencida si es 0.
        estado: dias > 0 ? 'congelada' : 'vencida',
        updated_at: getColombiaISOString()
      })
      .eq('id', id)
    memError = error;
  } else {
    // Si el usuario quiere que le queden X días, la fecha fin es hoy + X días
    const nuevaFechaFin = addDays(hoy, dias)
    const fechaFinString = format(nuevaFechaFin, 'yyyy-MM-dd')

    const { error } = await supabase
      .from('membresias')
      .update({ 
        fecha_fin: fechaFinString,
        estado: dias > 0 ? 'activa' : 'vencida',
        updated_at: getColombiaISOString()
      })
      .eq('id', id)
    memError = error;
  }

  if (memError) {
    logger.error('Error updating membership days:', { error: memError })
    return { success: false, error: 'Error interno del servidor' }
  }

  // 3. Registrar en el historial de ajustes
  if (user) {
    await supabase.from('historial_ajustes_dias').insert({
      membresia_id: id,
      dias_anteriores: diasAnteriores,
      dias_nuevos: dias,
      dias_diferencia: dias - diasAnteriores,
      motivo: 'Ajuste manual desde perfil',
      registrado_por: user.id,
      created_at: getColombiaISOString()
    })
  }

  // 4. Sincronizar el estado del cliente
  if (memData?.cliente_id) {
    await supabase
      .from('clientes')
      .update({ estado: dias > 0 ? 'activo' : 'inactivo' })
      .eq('id', memData.cliente_id)
    
    // Revalidar el perfil específico del cliente
    revalidatePath(`/clientes/${memData.cliente_id}`)
  }

  revalidatePath('/clientes')
  revalidatePath('/asistencia')
  revalidatePath('/dashboard')
  
  return { success: true }
}
