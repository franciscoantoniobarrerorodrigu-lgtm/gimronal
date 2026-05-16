'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Bell, Clock, User, LogOut, Dumbbell, AlertTriangle } from 'lucide-react'
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
import { getClientesLargaEstancia, registrarSalidaCliente } from '@/lib/supabase/actions/asistencia'
import { showPremiumToast } from '@/lib/notifications'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const prevNotifCount = useRef(0)

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
      const data = await getClientesLargaEstancia()
      setNotifications(data)
      
      // Reproducir sonido si hay nuevas alertas
      if (data.length > prevNotifCount.current) {
        playAlertSound()
      }
      prevNotifCount.current = data.length
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    
    const supabase = createClient()
    const channelId = `notificaciones_realtime_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes', 
        { event: '*', schema: 'public', table: 'asistencia' }, 
        () => {
          fetchNotifications()
        }
      )
      .subscribe()

    // Respaldamos con un chequeo muy espaciado (cada 5 min) por si alguien supera el límite sin generar eventos
    const interval = setInterval(fetchNotifications, 300000) 
    
    return () => {
      clearInterval(interval)
      supabase.removeChannel(channel)
    }
  }, [])

  const handleSalida = async (id: string, nombre: string) => {
    setLoading(true)
    try {
      const res = await registrarSalidaCliente(id)
      if (res.success) {
        showPremiumToast.success('Operación Completada', `Se ha registrado la salida oficial para ${nombre}.`)
        setNotifications(prev => prev.filter(n => n.id !== id))
      } else {
        showPremiumToast.error('No se pudo registrar', res.error)
      }
    } catch (error) {
      showPremiumToast.error('Error de Sistema', 'Hubo un problema al intentar procesar la salida del cliente.')
    } finally {
      setLoading(false)
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
      <DropdownMenuContent align="end" className="w-80 bg-popover/95 backdrop-blur-xl border-border text-popover-foreground p-0 overflow-hidden shadow-2xl">
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
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-xs italic">No hay alertas de larga estancia</p>
            </div>
          ) : (
            <div className="p-1 space-y-1">
              {notifications.map((n) => {
                const entrada = new Date(n.entrada)
                const ahora = new Date()
                const diffMs = ahora.getTime() - entrada.getTime()
                const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
                const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

                return (
                  <div 
                    key={n.id} 
                    className="p-3 rounded-md bg-muted/50 hover:bg-muted transition-all duration-200 border border-transparent hover:border-primary/20 group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                        <AlertTriangle className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-semibold truncate text-foreground">{n.clienteNombre}</p>
                          <span className="text-[11px] bg-rose-500/20 text-rose-500 px-1.5 py-0.5 rounded-full font-bold">
                            ALERTA
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Ha superado el tiempo límite de estancia.
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-1 text-[11px] font-medium text-primary">
                            <Clock className="w-3 h-3" />
                            {diffHrs}h {diffMins}m
                          </div>
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            className="h-6 text-[11px] uppercase font-bold bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                            onClick={() => handleSalida(n.id, n.clienteNombre)}
                            disabled={loading}
                          >
                            {loading ? <Dumbbell className="w-3 h-3 animate-spin" /> : 'Marcar Salida'}
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
        <div className="p-3 bg-muted/30 border-t border-border">
          <p className="text-[11px] text-center text-muted-foreground uppercase tracking-widest font-black">
            GymControl Monitor — Estancia {'>'} 2h
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
