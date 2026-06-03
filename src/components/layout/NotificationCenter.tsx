'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Bell, Clock, User, LogOut, Dumbbell, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuGroup
} from '@/components/ui/dropdown-menu'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getClientesLargaEstancia, registrarSalidaClienteAction } from '@/lib/supabase/actions/asistencia'
import { getAdminNotificaciones, marcarNotificacionLeidaAction } from '@/lib/supabase/actions/dashboard'
import { useAction } from 'next-safe-action/hooks'
import { showPremiumToast } from '@/lib/notifications'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

type NotifType = 'larga_estancia' | 'general'

interface UnifiedNotification {
  id: string
  type: NotifType
  title: string
  message: string
  timestamp: string | Date
  meta?: any
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<UnifiedNotification[]>([])
  const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({})
  const [isRefreshing, setIsRefreshing] = useState(false)
  const prevNotifCount = useRef(0)

  const { executeAsync: ejecutarSalida } = useAction(registrarSalidaClienteAction)
  const { executeAsync: ejecutarLeida } = useAction(marcarNotificacionLeidaAction)

  const playAlertSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  };

  const fetchNotifications = async () => {
    setIsRefreshing(true)
    try {
      const [largaEstanciaData, generalData] = await Promise.all([
        getClientesLargaEstancia(),
        getAdminNotificaciones()
      ])
      
      const unified: UnifiedNotification[] = []
      
      // Mapear larga estancia
      largaEstanciaData.forEach((le: any) => {
        unified.push({
          id: `le_${le.id}`,
          type: 'larga_estancia',
          title: le.clienteNombre,
          message: 'Ha superado el tiempo límite de estancia.',
          timestamp: le.entrada,
          meta: { originalId: le.id }
        })
      })

      // Mapear notificaciones generales (solicitudes, etc)
      generalData.forEach((gen: any) => {
        unified.push({
          id: `gen_${gen.id}`,
          type: 'general',
          title: gen.tipo === 'renovacion' ? 'Solicitud de Renovación' : 'Nueva Notificación',
          message: gen.mensaje,
          timestamp: gen.created_at,
          meta: { originalId: gen.id }
        })
      })

      // Ordenar por más reciente (si timestamp existe)
      unified.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      
      setNotifications(unified)
      
      if (unified.length > prevNotifCount.current) {
        playAlertSound()
      }
      prevNotifCount.current = unified.length
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    
    const supabase = createClient()
    const channelId = `notif_realtime_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    
    // Suscripción a asistencia y a notificaciones
    const channel = supabase
      .channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'asistencia' }, () => fetchNotifications())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notificaciones' }, () => fetchNotifications())
      .subscribe()

    const interval = setInterval(fetchNotifications, 60000) 
    
    return () => {
      clearInterval(interval)
      supabase.removeChannel(channel)
    }
  }, [])

  const handleAction = async (notif: UnifiedNotification) => {
    setLoadingIds(prev => ({ ...prev, [notif.id]: true }))
    try {
      if (notif.type === 'larga_estancia') {
        const res = await ejecutarSalida({ asistenciaId: notif.meta.originalId })
        if (res?.data?.success) {
          showPremiumToast.success('Operación Completada', `Salida registrada para ${notif.title}.`)
          setNotifications(prev => prev.filter(n => n.id !== notif.id))
        } else {
          showPremiumToast.error('No se pudo registrar', res?.data?.error || 'Error')
        }
      } else if (notif.type === 'general') {
        const res = await ejecutarLeida({ id: notif.meta.originalId })
        if (res?.data?.success) {
          showPremiumToast.success('Notificación archivada', 'Marcada como leída correctamente.')
          setNotifications(prev => prev.filter(n => n.id !== notif.id))
        }
      }
    } catch (error) {
      showPremiumToast.error('Error de Sistema', 'Hubo un problema al procesar la alerta.')
    } finally {
      setLoadingIds(prev => ({ ...prev, [notif.id]: false }))
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }), 
            "relative group outline-none"
          )}
          aria-label={`Notificaciones${notifications.length > 0 ? ` (${notifications.length} alertas)` : ''}`}
        >
          <Bell className={cn(
            "w-5 h-5 transition-all duration-300",
            notifications.length > 0 ? "text-primary animate-pulse" : "text-muted-foreground group-hover:text-foreground"
          )} />
          {notifications.length > 0 && (
            <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center bg-primary text-[10px] border-2 border-black">
              {notifications.length}
            </Badge>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[calc(100vw-32px)] sm:w-80 bg-popover/95 backdrop-blur-xl border-border text-popover-foreground p-0 overflow-hidden shadow-2xl">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-4 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              <span>Notificaciones</span>
            </div>
            {isRefreshing && <Dumbbell className="w-3 h-3 animate-spin opacity-50" />}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-20 text-emerald-500" />
              <p className="text-xs italic">No hay alertas pendientes</p>
            </div>
          ) : (
            <div className="p-1 space-y-1">
              {notifications.map((n) => {
                const isLoading = loadingIds[n.id]

                return (
                  <div 
                    key={n.id} 
                    className="p-3 rounded-md bg-muted/50 hover:bg-muted transition-all duration-200 border border-transparent hover:border-primary/20 group"
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors", 
                        n.type === 'larga_estancia' ? "bg-primary/10 group-hover:bg-primary/20 text-primary" : "bg-blue-500/10 group-hover:bg-blue-500/20 text-blue-500"
                      )}>
                        {n.type === 'larga_estancia' ? <AlertTriangle className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-semibold truncate text-foreground">{n.title}</p>
                          {n.type === 'larga_estancia' && (
                            <span className="text-[11px] bg-rose-500/20 text-rose-500 px-1.5 py-0.5 rounded-full font-bold">ALERTA</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {n.message}
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            className={cn("h-6 text-[11px] uppercase font-bold transition-all", 
                              n.type === 'larga_estancia' 
                                ? "bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground" 
                                : "bg-blue-500/20 text-blue-500 hover:bg-blue-500 hover:text-white"
                            )}
                            onClick={() => handleAction(n)}
                            disabled={isLoading}
                          >
                            {isLoading ? <Dumbbell className="w-3 h-3 animate-spin" /> : (n.type === 'larga_estancia' ? 'Marcar Salida' : 'Marcar Leída')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        <DropdownMenuSeparator className="bg-border m-0" />
        <div className="p-3 bg-muted/30 border-t border-border flex justify-between items-center">
          <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-black">
            GymControl Monitor
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

