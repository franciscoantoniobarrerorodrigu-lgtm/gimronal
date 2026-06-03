import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

import { redirect } from 'next/navigation'

export async function requireAuth() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/login')
  }

  // Fetch profile to check if it's a SaaS admin
  const { data: profile } = await supabase
    .from('perfiles')
    .select('is_saas_admin, gimnasio_id, rol, nombre')
    .eq('id', user.id)
    .single()

  const cookieStore = await cookies()
  const impersonatedGymId = cookieStore.get('active_gym_id')?.value

  // Logic to determine which gimnasio_id to use
  let activeGymId = profile?.gimnasio_id

  if (profile?.is_saas_admin && impersonatedGymId) {
    activeGymId = impersonatedGymId
  }

  // Fetch gym data if we have an activeGymId to check status
  let gymData = null
  if (activeGymId) {
    const { data } = await supabase
      .from('gimnasios')
      .select('nombre, activo, vencimiento_licencia')
      .eq('id', activeGymId)
      .single()
    gymData = data
  }

    const todayStr = new Date().toISOString().split('T')[0]
    const vencimientoStr = gymData?.vencimiento_licencia ? new Date(gymData.vencimiento_licencia).toISOString().split('T')[0] : null
    const isLicenseExpired = vencimientoStr ? vencimientoStr <= todayStr : false

    return { 
      supabase, 
      user, 
      profile, 
      activeGymId,
      isSaaSAdmin: !!profile?.is_saas_admin,
      isGymActive: gymData ? (gymData.activo !== false && !isLicenseExpired) : true,
      isLicenseExpired,
      gymData
    }
}
