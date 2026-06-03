'use client'

import { useState, useEffect } from 'react'
import { getPlanesDisponibles, solicitarPlanWhatsApp } from '@/lib/supabase/actions/portal'
import { Loader2, RefreshCw, Smartphone, CheckCircle2, CalendarDays } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { showPremiumToast } from '@/lib/notifications'

export default function ComprarPlanModal() {
  const [open, setOpen] = useState(false)
  const [planes, setPlanes] = useState<any[]>([])
  const [loadingPlanes, setLoadingPlanes] = useState(false)
  const [loadingComprar, setLoadingComprar] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      cargarPlanes()
    }
  }, [open])

  async function cargarPlanes() {
    setLoadingPlanes(true)
    const res = await getPlanesDisponibles()
    if (res.success && res.data) {
      setPlanes(res.data)
    } else {
      showPremiumToast.error('Error', res.error || 'No se pudieron cargar los planes')
    }
    setLoadingPlanes(false)
  }

  async function handleAdquirir(planId: string) {
    setLoadingComprar(planId)
    try {
      const res = await solicitarPlanWhatsApp(planId)
      if (res.success && res.data) {
        // Redirigir a WhatsApp
        const waUrl = `https://wa.me/${res.data.telefono}?text=${encodeURIComponent(res.data.mensaje)}`
        window.open(waUrl, '_blank')
        setOpen(false) // Cerrar el modal
      } else {
        showPremiumToast.error('Error', res.error || 'No se pudo procesar la solicitud')
      }
    } catch (e) {
      showPremiumToast.error('Error', 'Hubo un error inesperado al procesar la solicitud')
    } finally {
      setLoadingComprar(null)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="group relative flex w-full items-center justify-between rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent p-4 text-left shadow-lg shadow-primary/5 transition-all duration-300 hover:bg-primary/20 md:p-5 mt-4">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/20 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-black">
              <RefreshCw className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="break-words text-base font-black leading-tight text-white">Solicitar renovación</h3>
              <p className="mt-0.5 break-words text-xs font-medium text-zinc-400">
                Selecciona un plan y contáctanos por WhatsApp
              </p>
            </div>
          </div>
        </button>
      </DialogTrigger>

      <DialogContent className="max-h-[85dvh] overflow-y-auto border-white/10 bg-zinc-950/95 text-white backdrop-blur-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black italic tracking-tighter">
            Planes <span className="text-primary">Disponibles</span>
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Elige el plan que deseas adquirir. Te redirigiremos a WhatsApp para finalizar la compra directamente con tu gimnasio.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex flex-col gap-3 pb-2">
          {loadingPlanes ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : planes.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/5 py-8 text-center">
              <p className="text-sm text-zinc-400">No hay planes activos disponibles en este momento.</p>
            </div>
          ) : (
            planes.map((plan) => (
              <div
                key={plan.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:border-primary/50 hover:bg-primary/5"
              >
                <div className="mb-4">
                  <h4 className="text-lg font-black text-white">{plan.nombre}</h4>
                  <p className="mt-1 text-sm text-zinc-400">{plan.descripcion || 'Plan de acceso al gimnasio'}</p>
                  
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold text-white">
                      <CalendarDays className="h-3 w-3 text-primary" />
                      {plan.duracion_dias} días
                    </div>
                    {plan.incluye_clases_grupales && (
                      <div className="flex items-center gap-1.5 rounded-full bg-primary/20 px-2.5 py-1 text-xs font-bold text-primary">
                        <CheckCircle2 className="h-3 w-3" />
                        Clases Grupales
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-end justify-between border-t border-white/10 pt-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Valor</p>
                    <p className="text-xl font-black text-white">{formatPrice(plan.precio)}</p>
                  </div>
                  
                  <button
                    onClick={() => handleAdquirir(plan.id)}
                    disabled={loadingComprar !== null}
                    className="flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-black text-black transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {loadingComprar === plan.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Smartphone className="h-4 w-4" />
                        Adquirir
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
