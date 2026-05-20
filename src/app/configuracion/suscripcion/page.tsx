'use client'

import React, { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, FileSignature, ShieldCheck, Zap, Loader2 } from 'lucide-react'
import { getGimnasio, updateGimnasioSettings } from '@/lib/supabase/actions/gimnasio'
import { showPremiumToast } from '@/lib/notifications'
import { Badge } from '@/components/ui/badge'

export default function SuscripcionDianPage() {
  const [gymInfo, setGymInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getGimnasio()
        setGymInfo(data)
      } catch (error) {
        showPremiumToast.error('Error', 'No se pudo cargar la información del gimnasio')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleAdquirirModulo = () => {
    // Redirigir a WhatsApp para coordinar el pago
    const phoneNumber = "573000000000" // Reemplazar con el número real de ventas
    const message = encodeURIComponent(`Hola, me interesa adquirir el Módulo Premium de Facturación Electrónica DIAN para mi gimnasio: ${gymInfo?.nombre || ''}. ¿Cuáles son los métodos de pago?`)
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank')
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    )
  }

  const isActive = gymInfo?.modulo_dian_activo

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-in-fade">
        <SectionHeader 
          title="Facturación Electrónica DIAN" 
          subtitle="Cumple con la normativa fiscal colombiana automatizando tus facturas."
        />

        {isActive ? (
          <Card className="border-emerald-500/30 bg-emerald-500/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
            <CardHeader className="text-center pb-2">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                <ShieldCheck className="w-10 h-10 text-emerald-500" />
              </div>
              <CardTitle className="text-3xl font-black italic tracking-tight text-emerald-400">
                MÓDULO ACTIVO
              </CardTitle>
              <CardDescription className="text-emerald-200/70 text-base max-w-md mx-auto">
                Tu gimnasio está configurado para emitir facturación electrónica con Factus API de manera ilimitada.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/20">
                  <FileSignature className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                  <p className="font-bold text-sm">Emisión Automática</p>
                  <p className="text-xs text-muted-foreground mt-1">Sincronización en tiempo real</p>
                </div>
                <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/20">
                  <Zap className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                  <p className="font-bold text-sm">Control de Topes</p>
                  <p className="text-xs text-muted-foreground mt-1">Detección de tope 5 UVT</p>
                </div>
                <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/20">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                  <p className="font-bold text-sm">Cumplimiento Fiscal</p>
                  <p className="text-xs text-muted-foreground mt-1">100% legal con la DIAN</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
              <div>
                <Badge variant="outline" className="border-primary/50 text-primary mb-4 bg-primary/10 uppercase tracking-widest text-xs px-3 py-1">
                  Add-on Premium
                </Badge>
                <h2 className="text-3xl font-black italic uppercase tracking-tight mb-4">
                  Eleva tu nivel <br/>
                  <span className="text-primary">Administrativo</span>
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Evita multas y profesionaliza tu gimnasio. Con nuestro módulo de Facturación Electrónica DIAN integrado con Factus, emitir facturas legales nunca fue tan fácil.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-100">Detección Automática de UVT</h4>
                    <p className="text-sm text-zinc-400">El sistema te avisa y bloquea ventas sin factura cuando se superan los topes exigidos por la DIAN (5 UVT).</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <FileSignature className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-100">Cero Procesos Manuales</h4>
                    <p className="text-sm text-zinc-400">No uses otro software. Cada pago se envía a Factus y la DIAN directamente desde tu panel de cobro.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-100">Soporte y Trazabilidad</h4>
                    <p className="text-sm text-zinc-400">Consulta el estado, CUFE y URL de cada factura electrónica en tu reporte de pagos.</p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="border-primary/50 bg-black/60 shadow-2xl relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50 rounded-xl"></div>
              <CardHeader className="text-center pb-4 relative z-10">
                <CardTitle className="text-xl font-bold text-zinc-100">Módulo Facturación DIAN</CardTitle>
                <div className="my-6">
                  <span className="text-5xl font-black italic tracking-tighter text-white">$49.000</span>
                  <span className="text-muted-foreground font-medium">/mes</span>
                </div>
                <CardDescription>
                  Facturas ilimitadas incluidas en tu suscripción actual.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 space-y-4">
                <ul className="space-y-3 text-sm font-medium text-zinc-300">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    Facturación ilimitada con Factus API
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    Botón de facturación manual
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    Topes inteligentes 5 UVT
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    Soporte prioritario DIAN
                  </li>
                </ul>
              </CardContent>
              <CardFooter className="relative z-10 pt-4 flex flex-col gap-3">
                <Button 
                  className="w-full h-12 text-md font-bold hover:scale-105 transition-transform gap-2"
                  onClick={handleAdquirirModulo}
                >
                  💬 Contactar por WhatsApp para Adquirir
                </Button>
                <p className="text-[10px] text-zinc-500 text-center italic">
                  Una vez confirmado tu pago, el módulo se activará automáticamente.
                </p>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
