'use server'

import { createClient, requireAuth } from '@/lib/supabase/server'
import { Database } from '@/types/supabase'

type ClaseRow = Database['public']['Tables']['clases']['Row']
type ClaseInsert = Database['public']['Tables']['clases']['Insert']
type ClaseUpdate = Database['public']['Tables']['clases']['Update']

export async function getClases() {
  const { supabase, activeGymId } = await requireAuth()
  if (!activeGymId) return { success: false, error: 'Gimnasio no encontrado' }
  
  const { data, error } = await supabase
    .from('clases')
    .select(`
      *,
      entrenadores (
        id,
        nombre
      )
    `)
    .eq('gimnasio_id', activeGymId)
    .order('dia_semana', { ascending: true })
    .order('hora_inicio', { ascending: true })

  if (error) {
    console.error('Error fetching clases:', error)
    return { success: false, error: 'Error interno del servidor' }
  }

  return { success: true, data: data as (ClaseRow & { entrenadores: { id: string, nombre: string } | null })[] }
}

export async function createClase(clase: ClaseInsert) {
  const { supabase, activeGymId } = await requireAuth()
  if (!activeGymId) return { success: false, error: 'Gimnasio no encontrado' }
  
  const { data, error } = await supabase
    .from('clases')
    .insert({ ...clase, gimnasio_id: activeGymId })
    .select()
    .single()

  if (error) {
    console.error('Error creating clase:', error)
    return { success: false, error: 'Error interno del servidor' }
  }

  return { success: true, data }
}

export async function updateClase(id: string, clase: ClaseUpdate) {
  const { supabase, activeGymId } = await requireAuth()
  if (!activeGymId) return { success: false, error: 'Gimnasio no encontrado' }
  
  const { data, error } = await supabase
    .from('clases')
    .update(clase)
    .eq('id', id)
    .eq('gimnasio_id', activeGymId)
    .select()
    .single()

  if (error) {
    console.error('Error updating clase:', error)
    return { success: false, error: 'Error interno del servidor' }
  }

  return { success: true, data }
}

export async function deleteClase(id: string) {
  const { supabase, activeGymId } = await requireAuth()
  if (!activeGymId) return { success: false, error: 'Gimnasio no encontrado' }
  
  const { error } = await supabase
    .from('clases')
    .delete()
    .eq('id', id)
    .eq('gimnasio_id', activeGymId)

  if (error) {
    console.error('Error deleting clase:', error)
    return { success: false, error: 'Error interno del servidor' }
  }

  return { success: true }
}
