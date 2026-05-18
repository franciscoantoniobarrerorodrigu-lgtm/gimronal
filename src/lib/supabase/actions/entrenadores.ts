'use server'

import { createClient, requireAuth } from '@/lib/supabase/server'
import { Database } from '@/types/supabase'
import { logger } from '@/lib/logger'

type EntrenadorRow = Database['public']['Tables']['entrenadores']['Row']
type EntrenadorInsert = Database['public']['Tables']['entrenadores']['Insert']
type EntrenadorUpdate = Database['public']['Tables']['entrenadores']['Update']

export async function getEntrenadores() {
  const { supabase, activeGymId } = await requireAuth()
  if (!activeGymId) return { success: false, error: 'Gimnasio no encontrado' }
  
  const { data, error } = await supabase
    .from('entrenadores')
    .select('*')
    .eq('gimnasio_id', activeGymId)
    .order('nombre')

  if (error) {
    logger.error('Error fetching entrenadores:', { error })
    return { success: false, error: 'Error interno del servidor' }
  }

  return { success: true, data: data as EntrenadorRow[] }
}

export async function createEntrenador(entrenador: EntrenadorInsert) {
  const { supabase, activeGymId } = await requireAuth()
  if (!activeGymId) return { success: false, error: 'Gimnasio no encontrado' }
  
  const { data, error } = await supabase
    .from('entrenadores')
    .insert({ ...entrenador, gimnasio_id: activeGymId })
    .select()
    .single()

  if (error) {
    logger.error('Error creating entrenador:', { error })
    return { success: false, error: 'Error interno del servidor' }
  }

  return { success: true, data }
}

export async function updateEntrenador(id: string, entrenador: EntrenadorUpdate) {
  const { supabase, activeGymId } = await requireAuth()
  if (!activeGymId) return { success: false, error: 'Gimnasio no encontrado' }
  
  const { data, error } = await supabase
    .from('entrenadores')
    .update(entrenador)
    .eq('id', id)
    .eq('gimnasio_id', activeGymId)
    .select()
    .single()

  if (error) {
    logger.error('Error updating entrenador:', { error })
    return { success: false, error: 'Error interno del servidor' }
  }

  return { success: true, data }
}

export async function deleteEntrenador(id: string) {
  const { supabase, activeGymId } = await requireAuth()
  if (!activeGymId) return { success: false, error: 'Gimnasio no encontrado' }
  
  const { error } = await supabase
    .from('entrenadores')
    .delete()
    .eq('id', id)
    .eq('gimnasio_id', activeGymId)

  if (error) {
    logger.error('Error deleting entrenador:', { error })
    return { success: false, error: 'Error interno del servidor' }
  }

  return { success: true }
}
