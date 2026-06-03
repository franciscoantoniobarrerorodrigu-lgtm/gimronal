'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { getClientNotificaciones, marcarNotificacionesLeidas } from '@/lib/supabase/actions/portal'

interface NotificationRecord {
  id: string
  titulo?: string | null
  tipo?: string | null
  mensaje?: string | null
  created_at: string
  estado_envio?: string | null
  leida?: boolean | null
}

interface ClientNotification {
  id: string
  title: string
  message?: string | null
  time: string
  isRead: boolean
  type: 'info'
}

export default function ClientNotifications() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<ClientNotification[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  useEffect(() => {
    async function fetchNotifs() {
      const res = await getClientNotificaciones()
      if (res.success && res.data) {
        const mapped = (res.data as NotificationRecord[]).map((n) => ({
          id: n.id,
          title: n.titulo || n.tipo || 'Notificación',
          message: n.mensaje,
          time: new Date(n.created_at).toLocaleDateString('es-CO'),
          isRead: Boolean(n.estado_envio === 'leido' || n.leida),
          type: 'info' as const
        }))
        setNotifications(mapped)
      }
    }
    fetchNotifs()
  }, [])

  const unreadCount = notifications.filter(n => !n.isRead).length

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return
    setIsLoading(true)
    const res = await marcarNotificacionesLeidas()
    if (res.success) {
      setNotifications(notifications.map(n => ({ ...n, isRead: true })))
    }
    setIsLoading(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="relative flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary sm:size-10 sm:rounded-full">
          <Bell className="size-4 text-zinc-300 sm:size-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 size-2.5 rounded-full border-2 border-zinc-900 bg-red-500 animate-pulse sm:right-2" />
          )}
        </button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="z-50 mr-2 w-[calc(100vw-1.5rem)] max-w-80 rounded-2xl border-white/10 bg-zinc-950/95 p-0 shadow-2xl backdrop-blur-xl md:mr-0" 
        align="end"
        sideOffset={12}
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-black text-white italic tracking-tight">Notificaciones</h3>
          {unreadCount > 0 && (
            <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">
              {unreadCount} nuevas
            </span>
          )}
        </div>
        
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="w-8 h-8 text-zinc-600 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium text-zinc-500">No tienes notificaciones</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notif) => (
                <div 
                  key={notif.id}
                  className={`p-4 border-b border-white/5 transition-colors hover:bg-white/[0.02] cursor-pointer ${
                    !notif.isRead ? 'bg-primary/[0.03]' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-sm font-bold ${!notif.isRead ? 'text-white' : 'text-zinc-300'}`}>
                      {notif.title}
                    </h4>
                    {!notif.isRead && (
                      <span className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed mb-2">
                    {notif.message}
                  </p>
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                    {notif.time}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-3 border-t border-white/10 bg-black/20 rounded-b-2xl">
          <Button 
            variant="ghost" 
            className="w-full text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 h-8"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0 || isLoading}
          >
            {isLoading ? 'Marcando...' : 'Marcar todas como leídas'}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
