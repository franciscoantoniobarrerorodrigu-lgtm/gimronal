import React from 'react'
import { ShieldAlert, CreditCard, MessageCircle, ExternalLink, CalendarClock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface InactiveGymGuardProps {
  gymName: string
  type?: 'inactive' | 'expired'
}

export function InactiveGymGuard({ gymName, type = 'inactive' }: InactiveGymGuardProps) {
  const whatsappNumber = '573215633502'
  const isExpired = type === 'expired'
  
  const whatsappMessage = encodeURIComponent(
    isExpired 
      ? `Hola, soy administrador del gimnasio "${gymName}". Mi licencia ha vencido y necesito renovarla.`
      : `Hola, soy administrador del gimnasio "${gymName}". Mi sede está inactiva y necesito información para reactivarla.`
  )
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-xl p-4">
      <div className={`max-w-md w-full bg-card border ${isExpired ? 'border-orange-500/20' : 'border-amber-500/20'} rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300`}>
        <div className={`${isExpired ? 'bg-orange-500/10' : 'bg-amber-500/10'} p-6 flex justify-center border-b ${isExpired ? 'border-orange-500/10' : 'border-amber-500/10'}`}>
          <div className={`w-16 h-16 ${isExpired ? 'bg-orange-500/20' : 'bg-amber-500/20'} rounded-full flex items-center justify-center`}>
            {isExpired ? (
              <CalendarClock className="w-8 h-8 text-orange-500" />
            ) : (
              <ShieldAlert className="w-8 h-8 text-amber-500" />
            )}
          </div>
        </div>
        
        <div className="p-8 text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {isExpired ? 'Licencia Expirada' : 'Acceso Restringido'}
            </h2>
            <p className="text-muted-foreground">
              El gimnasio <span className="text-white font-semibold">&quot;{gymName}&quot;</span> {isExpired ? 'requiere una renovación de licencia.' : 'se encuentra temporalmente inactivo.'}
            </p>
          </div>

          <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/5 text-sm text-muted-foreground">
            {isExpired ? (
              <p>Tu periodo de suscripción ha finalizado. Para seguir disfrutando de todas las funciones de GymControl, por favor realiza la renovación de tu licencia.</p>
            ) : (
              <p>Esto suele suceder por pagos pendientes o mantenimiento del sistema. Por favor, contacta con soporte para reactivar tu cuenta.</p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full">
              <Button className={`w-full ${isExpired ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'} text-white shadow-lg ${isExpired ? 'shadow-orange-500/20' : 'shadow-green-500/20'}`}>
                <MessageCircle className="w-4 h-4 mr-2" />
                {isExpired ? 'Renovar ahora por WhatsApp' : 'Contactar por WhatsApp'}
              </Button>
            </a>

            {!isExpired && (
              <a href={`${whatsappUrl}&text=${encodeURIComponent(`Hola, necesito verificar el estado de pago del gimnasio "${gymName}".`)}`} target="_blank" rel="noopener noreferrer" className="w-full">
                <Button variant="outline" className="w-full border-blue-500/20 text-blue-400 hover:bg-blue-500/10">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Verificar Pagos
                </Button>
              </a>
            )}
            
            <Link href="/login" className="w-full">
              <Button variant="outline" className="w-full border-white/10 hover:bg-white/5">
                Volver al Inicio
              </Button>
            </Link>
          </div>

          <div className="pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ExternalLink className="w-3 h-3" />
            <span>Soporte: +57 321 563 3502</span>
          </div>
        </div>
      </div>
    </div>
  )
}
