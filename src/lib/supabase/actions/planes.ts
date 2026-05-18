'use server'

import { createClient, requireAuth } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logger } from '@/lib/logger'

export async function getPlanes() {
  const { supabase, activeGymId } = await requireAuth()
  if (!activeGymId) return []
  
  const { data, error } = await supabase
    .from('planes')
    .select('*')
    .eq('activo', true)
    .eq('gimnasio_id', activeGymId)
    .order('precio', { ascending: true })

  if (error) {
    logger.error('Error fetching planes:', { error })
    return []
  }

  return data || []
}

export async function createPlan(formData: any) {
  const { supabase, activeGymId } = await requireAuth()
  if (!activeGymId) return { success: false, error: 'Gimnasio no encontrado' }
  
  const { data, error } = await supabase
    .from('planes')
    .insert([{
      nombre: formData.nombre,
      descripcion: formData.descripcion || null,
      precio: formData.precio,
      duracion_dias: formData.duracion_dias,
      incluye_clases: formData.incluye_clases ?? true,
      aplica_iva: formData.aplica_iva ?? false,
      iva_porcentaje: formData.iva_porcentaje ?? 19,
      gimnasio_id: activeGymId,
      activo: true
    }])
    .select()

  if (error) {
    logger.error('Error creating plan:', { error })
    return { success: false, error: 'Error interno del servidor' }
  }

  revalidatePath('/planes')
  return { success: true, data }
}

export async function updatePlan(id: string, formData: any) {
  const { supabase, activeGymId } = await requireAuth()
  if (!activeGymId) return { success: false, error: 'Gimnasio no encontrado' }
  
  const { data, error } = await supabase
    .from('planes')
    .update({
      nombre: formData.nombre,
      descripcion: formData.descripcion || null,
      precio: formData.precio,
      duracion_dias: formData.duracion_dias,
      incluye_clases: formData.incluye_clases ?? true,
      aplica_iva: formData.aplica_iva ?? false,
      iva_porcentaje: formData.iva_porcentaje ?? 19,
    })
    .eq('id', id)
    .eq('gimnasio_id', activeGymId)
    .select()

  if (error) {
    logger.error('Error updating plan:', { error })
    return { success: false, error: 'Error interno del servidor' }
  }

  revalidatePath('/planes')
  return { success: true, data }
}

export async function deletePlan(id: string) {
  const { supabase, activeGymId } = await requireAuth()
  if (!activeGymId) return { success: false, error: 'Gimnasio no encontrado' }
  
  const { error } = await supabase
    .from('planes')
    .update({ activo: false })
    .eq('id', id)
    .eq('gimnasio_id', activeGymId)

  if (error) {
    logger.error('Error deleting plan:', { error })
    return { success: false, error: 'Error interno del servidor' }
  }

  revalidatePath('/planes')
  return { success: true }
}
