'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, KeyRound, Lock, LogOut, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { logoutCliente, updateClientPassword } from '@/lib/supabase/actions/portal'
import { showPremiumToast } from '@/lib/notifications'

export default function ForcePasswordChange() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPass !== confirmPass) {
      showPremiumToast.error('Contraseñas Diferentes', 'Las nuevas contraseñas no coinciden.')
      return
    }

    if (newPass.trim().length < 6) {
      showPremiumToast.error('Seguridad Débil', 'La nueva contraseña debe tener al menos 6 caracteres.')
      return
    }

    setLoading(true)
    try {
      const res = await updateClientPassword(currentPass, newPass)
      if (!res.success) {
        showPremiumToast.error('No se pudo actualizar', res.error || 'Intenta nuevamente.')
        return
      }

      showPremiumToast.success('Clave actualizada', 'Tu portal ya quedó protegido.')
      router.refresh()
    } catch {
      showPremiumToast.error('Error de Sistema', 'No se pudo procesar el cambio de contraseña.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logoutCliente()
    router.push('/login?tab=socio')
    router.refresh()
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <section className="w-full max-w-[440px] overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/85 text-white shadow-2xl shadow-black/40 backdrop-blur-2xl">
        <div className="border-b border-white/10 bg-white/[0.03] px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/15 text-primary">
              <ShieldCheck className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80">Acceso seguro</p>
              <h1 className="mt-1 text-xl font-black tracking-tight text-white">Cambia tu clave</h1>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-zinc-400">
            Para continuar en el portal, crea una contraseña personal. No puede ser tu documento.
          </p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-5 px-5 py-6">
          <div className="space-y-2">
            <Label htmlFor="forced-current-pass" className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Contraseña actual
            </Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-3.5 size-4 text-zinc-500" />
              <Input
                id="forced-current-pass"
                type="password"
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                className="h-12 rounded-xl border-white/10 bg-white/[0.04] pl-10 text-white focus:border-primary/60"
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="forced-new-pass" className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Nueva contraseña
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 size-4 text-zinc-500" />
              <Input
                id="forced-new-pass"
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="h-12 rounded-xl border-white/10 bg-white/[0.04] pl-10 text-white focus:border-primary/60"
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="forced-confirm-pass" className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Confirmar contraseña
            </Label>
            <div className="relative">
              <Check className="absolute left-3 top-3.5 size-4 text-zinc-500" />
              <Input
                id="forced-confirm-pass"
                type="password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                className="h-12 rounded-xl border-white/10 bg-white/[0.04] pl-10 text-white focus:border-primary/60"
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            loading={loading}
            className="h-12 w-full rounded-xl text-sm font-black uppercase tracking-wider"
          >
            Guardar y entrar
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={handleLogout}
            className="h-10 w-full text-zinc-400 hover:bg-white/5 hover:text-white"
          >
            <LogOut className="mr-2 size-4" />
            Salir
          </Button>
        </form>
      </section>
    </main>
  )
}
