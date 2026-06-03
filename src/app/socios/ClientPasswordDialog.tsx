'use client'

import { useState } from 'react'
import { Lock, KeyRound, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateClientPassword } from '@/lib/supabase/actions/portal'
import { showPremiumToast } from '@/lib/notifications'

export default function ClientPasswordDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPass !== confirmPass) {
      showPremiumToast.error('Contraseñas Diferentes', 'Las nuevas contraseñas ingresadas no coinciden. Por favor, verifica e intenta de nuevo.')
      return
    }

    if (newPass.length < 6) {
      showPremiumToast.error('Seguridad Débil', 'La nueva contraseña debe tener al menos 6 caracteres para ser aceptada.')
      return
    }

    setLoading(true)
    try {
      const res = await updateClientPassword(currentPass, newPass)
      if (res.success) {
        showPremiumToast.success('Acceso Actualizado', 'Tu nueva contraseña ha sido guardada. Por favor, úsala en tu próximo inicio de sesión.')
        setOpen(false)
        resetForm()
      } else {
        showPremiumToast.error('Fallo de Actualización', res.error || 'Error al actualizar la contraseña')
      }
    } catch {
      showPremiumToast.error('Error de Sistema', 'No se pudo procesar el cambio de contraseña en este momento.')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setCurrentPass('')
    setNewPass('')
    setConfirmPass('')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="size-9 rounded-xl p-0 text-muted-foreground transition-all hover:bg-white/5 hover:text-foreground sm:size-auto sm:px-2.5">
          <KeyRound className="size-4 sm:mr-2" />
          <span className="hidden sm:inline font-medium">Contraseña</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 border border-white/10 text-white overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
        
        <DialogHeader className="pt-4">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold tracking-tight">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            Cambiar Contraseña
          </DialogTitle>
          <DialogDescription className="text-white/60 text-sm mt-2">
            Asegura tu cuenta actualizando tu clave periódicamente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleUpdate} className="space-y-5 py-6">
          <div className="space-y-2">
            <Label htmlFor="current" className="text-xs uppercase tracking-wider text-white/50 font-semibold ml-1">
              Contraseña Actual
            </Label>
            <div className="relative group">
              <KeyRound className="absolute left-3 top-3 h-4 w-4 text-white/30 group-focus-within:text-primary transition-colors" />
              <Input
                id="current"
                type="password"
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                placeholder="••••••••"
                className="pl-10 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 h-11 transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new" className="text-xs uppercase tracking-wider text-white/50 font-semibold ml-1">
              Nueva Contraseña
            </Label>
            <div className="relative group">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-white/30 group-focus-within:text-primary transition-colors" />
              <Input
                id="new"
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Escribe tu nueva clave"
                className="pl-10 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 h-11 transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm" className="text-xs uppercase tracking-wider text-white/50 font-semibold ml-1">
              Confirmar Nueva Contraseña
            </Label>
            <div className="relative group">
              <Check className="absolute left-3 top-3 h-4 w-4 text-white/30 group-focus-within:text-primary transition-colors" />
              <Input
                id="confirm"
                type="password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Repite tu nueva clave"
                className="pl-10 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 h-11 transition-all"
                required
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(255,87,34,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Actualizando...
                </div>
              ) : (
                'Guardar Nueva Contraseña'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
