import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import LandingPageClient from './LandingPageClient'

const COOKIE_NAME = 'gym_client_session'

export default async function RootPage() {
  const supabase = await createClient()
  const cookieStore = await cookies()
  
  // 1. Verificar sesión de Administrador
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    redirect('/dashboard')
  }

  // 2. Verificar sesión de Socio
  const sessionCookie = cookieStore.get(COOKIE_NAME)
  if (sessionCookie?.value) {
    redirect('/socios')
  }

  // Si no hay ninguna sesión, mostrar la página de selección
  return <LandingPageClient />
}
