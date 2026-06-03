'use client'

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, ShieldCheck, AlertTriangle, Zap } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function LicenciaClient({ initialData }: { initialData: any }) {
  const [gymData, setGymData] = useState(initialData)
  
  React.useEffect(() => {
    setGymData(initialData)
  }, [initialData])

  const expiryDate = gymData?.vencimiento_licencia ? new Date(gymData.vencimiento_licencia) : null
  const isExpired = expiryDate ? expiryDate < new Date() : false
  const daysLeft = expiryDate 
    ? Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card className={`overflow-hidden border-2 transition-all ${
        isExpired 
          ? 'border-red-500/50 bg-red-500/5' 
          : daysLeft < 7 
            ? 'border-amber-500/50 bg-amber-500/5' 
            : 'border-blue-500/30 bg-blue-500/5'
      }`}>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Estado de Suscripción</p>
              <h2 className={`text-3xl font-black italic uppercase ${
                isExpired ? 'text-red-500' : daysLeft < 7 ? 'text-amber-500' : 'text-blue-500'
              }`}>
                {isExpired ? 'Vencida' : daysLeft < 7 ? 'Por Vencer' : 'Activa'}
              </h2>
            </div>
            <div className={`p-3 rounded-2xl ${
              isExpired ? 'bg-red-500/20 text-red-500' : daysLeft < 7 ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-500/20 text-blue-500'
            }`}>
              {isExpired ? <AlertTriangle className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <p className="text-xs text-muted-foreground mb-1">Vencimiento</p>
              <p className="text-lg font-bold flex items-center gap-2 text-white">
                <Calendar className="w-4 h-4 text-primary" />
                {expiryDate 
                  ? format(expiryDate, "d 'de' MMMM, yyyy", { locale: es })
                  : 'Sin fecha'}
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <p className="text-xs text-muted-foreground mb-1">Días Restantes</p>
              <p className={`text-lg font-bold flex items-center gap-2 ${
                daysLeft < 0 ? 'text-red-500' : 'text-white'
              }`}>
                <Zap className="w-4 h-4 text-amber-500" />
                {daysLeft > 0 ? daysLeft : 0} días
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="p-6 rounded-2xl bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm">
        <p className="text-sm text-blue-400 font-medium text-center leading-relaxed">
          Para renovar tu suscripción o adquirir más tiempo de licencia, por favor contacta con el soporte técnico o el administrador regional.
        </p>
      </div>
    </div>
  )
}
