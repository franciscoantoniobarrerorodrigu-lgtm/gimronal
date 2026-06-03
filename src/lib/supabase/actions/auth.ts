'use server'

import { createClient, requireAuth } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionClient } from '@/lib/safe-action'
import { z } from 'zod'

export const updatePasswordAction = actionClient
  .schema(z.object({
    newPassword: z.string().min(6)
  }))
  .action(async ({ parsedInput: { newPassword } }) => {
  const supabase = await createClient()

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error('Error updating password:', error)
    return { success: false, error: error.message }
  }
})

export const updateUserPasswordAsAdminAction = actionClient
  .schema(z.object({
    userId: z.string().uuid(),
    newPassword: z.string().min(6)
  }))
  .action(async ({ parsedInput: { userId, newPassword } }) => {
  // Solo el admin del gym puede llamar a esto, pero necesitamos el client admin para Auth
  const { supabase, profile, activeGymId, isSaaSAdmin } = await requireAuth()
  if (profile?.rol !== 'admin' && !isSaaSAdmin) {
    return { success: false, error: 'No tienes permisos para realizar esta acción' }
  }

  if (!isSaaSAdmin) {
    const { data: targetUser, error: targetError } = await supabase
      .from('perfiles')
      .select('id, gimnasio_id, is_saas_admin')
      .eq('id', userId)
      .maybeSingle()

    if (targetError || !targetUser || targetUser.gimnasio_id !== activeGymId || targetUser.is_saas_admin) {
      return { success: false, error: 'No tienes permisos para administrar este usuario' }
    }
  }

  const { createAdminClient } = await import('@/lib/supabase/admin')
  const adminClient = createAdminClient()

  try {
    const { error } = await adminClient.auth.admin.updateUserById(userId, {
      password: newPassword
    })

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error('Error updating user password as admin:', error)
    return { success: false, error: error.message }
  }
})
