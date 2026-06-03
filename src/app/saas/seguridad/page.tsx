'use client'

import React from 'react'
import { SaaSLayout } from '@/components/layout/SaaSLayout'
import { ShieldCheck, Key } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updatePasswordAction } from '@/lib/supabase/actions/auth'
import { useAction } from 'next-safe-action/hooks'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

export default function SaaSSeguridadPage() {
  const [newPassword, setNewPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')

  const { execute, isExecuting: loading } = useAction(updatePasswordAction, {
    onSuccess: ({ data: res }) => {
      if (res?.success) {
        toast.success('Contraseña actualizada correctamente')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        toast.error(res?.error || 'Error al actualizar la contraseña')
      }
    },
    onError: () => toast.error('Error de conexión')
  })

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    execute({ newPassword })
  }

  return (
    <SaaSLayout>
      <div className="space-y-8 max-w-4xl mx-auto pb-20">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 bg-white/[0.02] border border-white/5 p-8 rounded-3xl backdrop-blur-3xl shadow-2xl">
          <div className="space-y-1">
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 mb-2 font-bold tracking-widest text-[10px] px-3">
              GLOBAL SECURITY
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-white/80 to-white/40">
              Seguridad <span className="text-blue-500">Global</span>
            </h1>
            <p className="text-muted-foreground text-lg font-medium max-w-md">
              Gestiona tus credenciales de acceso como SuperAdministrador.
            </p>
          </div>
        </div>

        <Card className="bg-card/30 backdrop-blur-xl border-white/5 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.5)] overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
          <CardHeader className="border-b border-white/5 bg-white/[0.02] p-8">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-2xl border border-blue-500/20">
                <Key className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black tracking-tight text-white">Cambiar Contraseña</CardTitle>
                <CardDescription className="text-muted-foreground font-medium">Actualiza tu contraseña de acceso maestro de forma segura.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handlePasswordUpdate} className="space-y-6 max-w-md">
              <div className="space-y-3">
                <Label htmlFor="new-password" className="text-zinc-300 font-bold text-sm tracking-wide">Nueva Contraseña</Label>
                <Input 
                  id="new-password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-black/40 border-white/10 h-12 rounded-xl text-white placeholder:text-zinc-600 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 transition-all"
                  required
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="confirm-password" className="text-zinc-300 font-bold text-sm tracking-wide">Confirmar Contraseña</Label>
                <Input 
                  id="confirm-password"
                  type="password"
                  placeholder="Repite tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-black/40 border-white/10 h-12 rounded-xl text-white placeholder:text-zinc-600 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 transition-all"
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] h-12 rounded-xl font-black text-sm uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </SaaSLayout>
  )
}
