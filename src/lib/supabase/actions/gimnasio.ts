'use server'

import { createClient, requireAuth } from '@/lib/supabase/server'

import { logger } from '@/lib/logger'

export async function getGimnasio() {
  const { supabase, activeGymId } = await requireAuth()
  if (!activeGymId) return null

  const { data, error } = await supabase
    .from('gimnasios')
    .select('*')
    .eq('id', activeGymId)
    .single()

  if (error) return null
  return data
}

export async function updateGimnasio(id: string, updates: any) {
  const { supabase, activeGymId, isSaaSAdmin } = await requireAuth()
  
  // Solo permitir actualizar si es el gym activo, a menos que sea SaaS admin
  if (id !== activeGymId && !isSaaSAdmin) {
    throw new Error('No autorizado para actualizar este gimnasio')
  }

  const { error } = await supabase
    .from('gimnasios')
    .update(updates)
    .eq('id', id)

  if (error) throw error
  return { success: true }
}

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function updateGimnasioSettings(updates: any) {
  const { activeGymId } = await requireAuth()
  if (!activeGymId) return { success: false, error: 'No autorizado' }

  const adminClient = createAdminClient()
  const { error } = await adminClient
    .from('gimnasios')
    .update(updates)
    .eq('id', activeGymId)

  if (error) {
    logger.error('Error updating gym settings:', { error })
    return { success: false, error: error.message }
  }
  
  revalidatePath('/configuracion/suscripcion')
  return { success: true }
}

export async function getGymUsers() {
  const { activeGymId, supabase } = await requireAuth()
  if (!activeGymId) return []

  const { data, error } = await supabase
    .from('perfiles')
    .select('*')
    .eq('gimnasio_id', activeGymId)
    .order('nombre')

  if (error) {
    logger.error('Error fetching gym users:', { error })
    return []
  }

  return data
}
