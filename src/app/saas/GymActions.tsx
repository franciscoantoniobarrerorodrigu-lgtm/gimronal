'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, Trash2, Power, Ban, Zap } from 'lucide-react'
import { switchGymContext, deleteGym, toggleGymStatus, extendGymLicense } from '@/lib/supabase/actions/saas'
import { toast } from 'sonner'
import { showPremiumToast } from '@/lib/notifications'
import { useRouter } from 'next/navigation'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"

interface GymActionsProps {
  gymId: string
  gymName: string
  isActive: boolean
}

export function GymActions({ gymId, gymName, isActive }: GymActionsProps) {
  const [loading, setLoading] = React.useState(false)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const router = useRouter()

  const handleSwitch = async () => {
    setLoading(true)
    await switchGymContext(gymId)
  }

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de eliminar el gimnasio ${gymName}? Esta acción no se puede deshacer.`)) return
    
    setLoading(true)
    try {
      const res = await deleteGym(gymId)
      if (res.success) {
        showPremiumToast.success('Gimnasio Eliminado', 'La instancia ha sido removida permanentemente')
        router.refresh()
      } else {
        showPremiumToast.error('Error al Eliminar', res.error || 'No se pudo procesar la solicitud')
      }
    } catch (error: any) {
      showPremiumToast.error('Error de Conexión', 'Falló la comunicación con el servidor')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async () => {
    setLoading(true)
    try {
      const res = await toggleGymStatus(gymId, isActive)
      if (res.success) {
        showPremiumToast.success('Estado Actualizado', isActive ? 'Gimnasio desactivado exitosamente' : 'Gimnasio activado exitosamente')
        router.refresh()
      } else {
        showPremiumToast.error('Error de Estado', res.error || 'No se pudo cambiar el estado del gimnasio')
      }
    } catch (error: any) {
      showPremiumToast.error('Error de Conexión', 'Falló la comunicación con el servidor')
    } finally {
      setLoading(false)
    }
  }

  const handleExtendLicense = async (days: number) => {
    setLoading(true)
    try {
      const res = await extendGymLicense(gymId, days)
      if (res.success) {
        const message = days > 30000 ? 'Licencia de por vida activada' : `Se han añadido ${days} días de licencia`
        showPremiumToast.success('Licencia Extendida', message)
        setIsDialogOpen(false)
        router.refresh()
      } else {
        showPremiumToast.error('Error al Extender', res.error || 'No se pudo procesar la solicitud')
      }
    } catch (error: any) {
      showPremiumToast.error('Error de Conexión', 'Falló la comunicación con el servidor')
    } finally {
      setLoading(false)
    }
  }

  const extensionOptions = [
    { label: '30 Días', days: 30, color: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white' },
    { label: '3 Meses', days: 90, color: 'bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white' },
    { label: '6 Meses', days: 180, color: 'bg-purple-500/10 text-purple-500 hover:bg-purple-500 hover:text-white' },
    { label: '1 Año', days: 365, color: 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white' },
    { label: 'Ilimitado', days: 36500, color: 'bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white border-amber-500/50' },
  ]

  return (
    <div className="flex items-center gap-2">
      <Button 
        onClick={handleSwitch} 
        disabled={loading}
        variant="outline" 
        size="sm" 
        className="text-[10px] h-8 bg-blue-600/10 text-blue-400 border-blue-500/20 hover:bg-blue-600 hover:text-white"
      >
        <LayoutDashboard className="w-3.5 h-3.5 mr-1.5" />
        Ver Dashboard
      </Button>
      
      <Button 
        onClick={handleToggleStatus}
        disabled={loading}
        variant="ghost" 
        size="icon" 
        className={`h-8 w-8 ${isActive ? 'text-emerald-500 hover:text-amber-500 hover:bg-amber-500/10' : 'text-zinc-500 hover:text-emerald-500 hover:bg-emerald-500/10'}`}
        title={isActive ? 'Desactivar Gimnasio' : 'Activar Gimnasio'}
      >
        {isActive ? <Power className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            disabled={loading}
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
            title="Extender Licencia"
          >
            <Zap className="w-3.5 h-3.5 fill-amber-500/20" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[400px] bg-zinc-950 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-white flex items-center gap-2 italic uppercase">
              <Zap className="w-5 h-5 text-amber-500" />
              Regalar Licencia
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Selecciona el tiempo adicional que deseas otorgar a <span className="text-white font-bold">{gymName}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-4">
            {extensionOptions.map((opt) => (
              <Button
                key={opt.label}
                variant="outline"
                className={`h-12 font-black uppercase text-xs border-white/5 ${opt.color} ${opt.label === 'Ilimitado' ? 'col-span-2 text-sm' : ''}`}
                onClick={() => handleExtendLicense(opt.days)}
                disabled={loading}
              >
                {opt.label}
              </Button>
            ))}
          </div>
          <DialogFooter className="sm:justify-center border-t border-white/5 pt-4">
            <p className="text-[10px] text-zinc-500 font-medium italic uppercase tracking-widest text-center">
              El tiempo se sumará a partir de la fecha de vencimiento actual.
            </p>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button 
        onClick={handleDelete}
        disabled={loading}
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        title="Eliminar Gimnasio"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  )
}
