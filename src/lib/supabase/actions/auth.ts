'use server'

import { createClient, requireAuth } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updatePassword(newPassword: string) {
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
}

export async function updateUserPasswordAsAdmin(userId: string, newPassword: string) {
  // Solo el admin del gym puede llamar a esto, pero necesitamos el client admin para Auth
  const { profile } = await requireAuth()
  if (profile?.rol !== 'admin' && !profile?.is_saas_admin) {
    return { success: false, error: 'No tienes permisos para realizar esta acción' }
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
}
