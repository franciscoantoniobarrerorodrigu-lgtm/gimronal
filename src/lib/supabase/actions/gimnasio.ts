'use server'

import { requireAuth } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { actionClient } from '@/lib/safe-action'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

const optionalText = z.string().trim().max(255).optional()
const optionalTime = z.string().regex(/^\d{2}:\d{2}$/).optional()

const gimnasioPublicUpdatesSchema = z.object({
  nombre: z.string().trim().min(1).max(120).optional(),
  nit: z.string().trim().max(50).optional(),
  telefono: optionalText,
  email: z.string().trim().max(255).optional(),
  direccion: optionalText,
  ciudad: optionalText,
  horario_apertura: optionalTime,
  horario_cierre: optionalTime,
  aforo_maximo: z.coerce.number().int().min(1).max(10000).optional(),
  logo_url: z.string().trim().url().max(2048).optional(),
}).strict()

const gimnasioSettingsUpdatesSchema = z.object({
  tope_factura_electronica: z.coerce.number().min(0).max(999999999).optional(),
}).strict()

function canManageGym(profile: { rol?: string | null } | null | undefined, isSaaSAdmin: boolean) {
  return isSaaSAdmin || profile?.rol === 'admin'
}

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

export const updateGimnasioAction = actionClient
  .schema(z.object({
    id: z.string().uuid(),
    updates: gimnasioPublicUpdatesSchema
  }))
  .action(async ({ parsedInput: { id, updates } }) => {
  const { supabase, activeGymId, isSaaSAdmin, profile } = await requireAuth()
   
  // Solo permitir actualizar si es el gym activo, a menos que sea SaaS admin
  if ((id !== activeGymId && !isSaaSAdmin) || !canManageGym(profile, isSaaSAdmin)) {
    throw new Error('No autorizado para actualizar este gimnasio')
  }

  const { error } = await supabase
    .from('gimnasios')
    .update(updates)
    .eq('id', id)

  if (error) throw error
  return { success: true }
})

export const updateGimnasioSettingsAction = actionClient
  .schema(z.object({
    updates: gimnasioSettingsUpdatesSchema
  }))
  .action(async ({ parsedInput: { updates } }) => {
  const { activeGymId, profile, isSaaSAdmin } = await requireAuth()
  if (!activeGymId) return { success: false, error: 'No autorizado' }
  if (!canManageGym(profile, isSaaSAdmin)) return { success: false, error: 'No autorizado' }

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
})

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
