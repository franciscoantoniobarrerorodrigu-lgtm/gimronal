'use client'

import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { logoutCliente } from '@/lib/supabase/actions/portal'
import { showPremiumToast } from '@/lib/notifications'

export default function ClientLogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logoutCliente()
      showPremiumToast.success('Sesión Finalizada', 'Has cerrado sesión correctamente. ¡Te esperamos pronto!')
      router.push('/login?tab=socio')
      router.refresh()
    } catch {
      showPremiumToast.error('Error al cerrar sesión', 'No se pudo cerrar la sesión correctamente.')
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout} className="size-9 rounded-xl p-0 text-muted-foreground hover:text-foreground sm:size-auto sm:px-2.5">
      <LogOut className="size-4 sm:mr-2" />
      <span className="hidden sm:inline">Cerrar Sesión</span>
    </Button>
  )
}
