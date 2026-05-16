'use client'

import React, { useState } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { 
  ShieldCheck, 
  Calendar, 
  AlertTriangle, 
  Loader2, 
  Users, 
  History,
  CheckCircle2,
  Info,
  Sparkles
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { showPremiumToast } from '@/lib/notifications'
import { aplicarExoneracionGlobal, getExoneraciones } from '@/lib/supabase/actions/exoneraciones'
import { Badge } from '@/components/ui/badge'
import { SectionHeader } from '@/components/shared/SectionHeader'

export const dynamic = 'force-dynamic'

export default function ExoneracionesPage() {
  const [loading, setLoading] = useState(false)
  const [dias, setDias] = useState(1)
  const [motivo, setMotivo] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [historial, setHistorial] = useState<any[]>([])

  React.useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    const data = await getExoneraciones()
    setHistorial(data)
  }

  const handleExonerar = async () => {
    if (!motivo.trim()) {
      showPremiumToast.error('Motivo Requerido', 'Por favor ingresa un motivo para la exoneración')
      return
    }

    setLoading(true)
    try {
      const result = await aplicarExoneracionGlobal(dias, motivo)
      if (result.success) {
        showPremiumToast.success('Exoneración Registrada', `Se extendieron ${result.count} membresías por ${dias} día(s).`)
        setMotivo('')
        setDias(1)
        setConfirming(false)
        fetchHistory()
      } else {
        showPremiumToast.error('Fallo al Registrar', result.error)
      }
    } catch (error) {
      console.error(error)
      showPremiumToast.error('Error de sistema', 'Ocurrió un error inesperado al procesar la solicitud.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6 md:space-y-10 pb-20 animate-in-fade max-w-5xl mx-auto">
        <SectionHeader 
          title="Módulo de Exoneración" 
          subtitle="Compensa a tus clientes extendiendo vigencias automáticamente ante cierres imprevistos."
        />

        <div className="grid gap-8 md:grid-cols-3">
          <Card className="md:col-span-2 glass-card border-white/5 shadow-2xl overflow-hidden">
            <CardHeader className="p-8 pb-4 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black tracking-tight text-white">Nueva Exoneración Global</CardTitle>
                  <CardDescription className="text-zinc-500 font-medium text-xs">Se sumarán días de vigencia a todos los socios con planes activos.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid gap-6">
                <div className="space-y-3">
                  <Label htmlFor="dias" className="text-xs font-black uppercase tracking-widest text-zinc-400">Días a Compensar</Label>
                  <div className="flex items-center gap-4">
                    <Input 
                      id="dias" 
                      type="number" 
                      min="1" 
                      max="30" 
                      value={dias} 
                      onChange={(e) => setDias(parseInt(e.target.value) || 1)}
                      className="w-32 h-12 bg-white/5 border-white/10 text-lg font-black text-center focus:ring-primary/20 rounded-xl"
                    />
                    <span className="text-sm text-zinc-500 font-black tracking-tight uppercase">
                      día(s) adicional(es) de membresía.
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="motivo" className="text-xs font-black uppercase tracking-widest text-zinc-400">Motivo / Descripción</Label>
                  <Textarea 
                    id="motivo" 
                    placeholder="Ej: Cierre por mantenimiento, Festivo de Navidad, etc." 
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    className="min-h-[120px] resize-none bg-white/5 border-white/10 focus:ring-primary/20 rounded-xl p-4 text-sm font-medium"
                  />
                </div>
              </div>

              <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-5 shadow-inner">
                <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-black text-sm text-amber-500 uppercase tracking-widest">Acción Crítica e Irreversible</p>
                  <p className="text-xs text-amber-500/70 font-medium leading-relaxed">
                    Al ejecutar esta acción, la fecha de vencimiento de **TODOS** los clientes con planes activos se moverá hacia adelante. Esta operación no puede deshacerse de forma masiva.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="p-8 pt-0 flex justify-end">
              {!confirming ? (
                <Button 
                  onClick={() => setConfirming(true)}
                  className="h-12 px-8 bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition-transform font-black uppercase tracking-widest text-xs rounded-xl"
                >
                  Continuar a Confirmación
                </Button>
              ) : (
                <div className="flex gap-4 animate-in fade-in slide-in-from-right-4">
                  <Button variant="ghost" onClick={() => setConfirming(false)} disabled={loading} className="text-zinc-500 hover:text-white h-12 px-6 rounded-xl font-bold">
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleExonerar} 
                    disabled={loading}
                    className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 font-black uppercase tracking-widest text-xs rounded-xl"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      'Aplicar Exoneración Ahora'
                    )}
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>

          <div className="space-y-8">
            <Card className="glass-card border-white/5 bg-primary/5 overflow-hidden">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-primary">
                  <Sparkles className="w-4 h-4" />
                  ¿Cómo funciona?
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-2 space-y-4 text-[11px] text-zinc-400 leading-relaxed font-medium">
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-white font-black">1</div>
                  <p>Identifica clientes con membresía <Badge variant="outline" className="text-[9px] h-4 py-0 text-emerald-500 border-emerald-500/30 font-black">ACTIVA</Badge>.</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-white font-black">2</div>
                  <p>Suma el número de días a la <span className="text-zinc-200 font-bold">fecha_fin</span> actual.</p>
                </div>
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-white font-black">3</div>
                  <p>Ideal para compensar cierres por feriados o mantenimiento.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/5">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-white">
                  <History className="w-4 h-4 text-zinc-500" />
                  Historial Reciente
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-2">
                <div className="space-y-4">
                  {historial.length > 0 ? (
                    historial.slice(0, 5).map((item) => (
                      <div key={item.id} className="p-4 border border-white/5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors group">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-black text-xs text-primary">+{item.dias_compensados} DÍAS</span>
                          <span className="text-[9px] font-black text-zinc-500 uppercase">
                            {new Date(item.creado_en).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                          </span>
                        </div>
                        <p className="text-[10px] leading-relaxed text-zinc-400 font-medium line-clamp-2 italic">
                          "{item.descripcion}"
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-[10px] text-center py-12 text-zinc-500 font-black uppercase tracking-widest opacity-30 italic">
                      Sin registros previos.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
