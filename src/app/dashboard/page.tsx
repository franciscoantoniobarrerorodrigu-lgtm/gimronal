import React, { Suspense } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { 
  Users, CreditCard, Activity, TrendingUp, AlertTriangle, 
  Calendar, UserCheck, DollarSign, ArrowUpRight, ArrowDownRight, 
  Clock, Info, Dumbbell, ShieldCheck
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  getDashboardStats,
  getDashboardCharts, 
  getClasesHoy, 
  getEntrenadoresHoy,
  getRecentExonerations
} from '@/lib/supabase/actions/dashboard'
import { getUltimasAsistencias } from '@/lib/supabase/actions/asistencia'
import { RecentActivityClient } from '@/components/dashboard/RecentActivityClient'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { AttendanceChart } from '@/components/dashboard/AttendanceChart'
import { MembershipPieChart } from '@/components/dashboard/MembershipPieChart'
import Link from 'next/link'
import { requireAuth } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

async function DashboardContent() {
  const { activeGymId, isSaaSAdmin, isGymActive, gymData } = await requireAuth()
  
  if (!activeGymId) {
    if (isSaaSAdmin) {
      redirect('/saas')
    }
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center animate-in fade-in duration-700">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Info className="w-10 h-10 text-primary animate-pulse" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-white">¡Bienvenido a tu Dashboard!</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {isSaaSAdmin 
              ? "Aún no has seleccionado un gimnasio para administrar. Ve al panel global para elegir uno."
              : "Tu cuenta se está configurando. Por favor, contacta a tu administrador para que se te asigne un gimnasio."}
          </p>
        </div>
        {isSaaSAdmin && (
          <Link href="/saas">
            <Button size="lg" className="font-bold shadow-lg shadow-primary/20">
              Ir al Panel Maestro SaaS
            </Button>
          </Link>
        )}
      </div>
    )
  }

  const [statsData, asistencias, chartsData, clasesHoy, entrenadores, exoneraciones] = await Promise.all([
    getDashboardStats(),
    getUltimasAsistencias(50),
    getDashboardCharts(),
    getClasesHoy(),
    getEntrenadoresHoy(),
    getRecentExonerations()
  ])

  const currencyFormatter = new Intl.NumberFormat('es-CO', { 
    style: 'currency', 
    currency: 'COP', 
    maximumFractionDigits: 0 
  })

  const mainStats = [
    { 
      name: 'Membresías Activas', 
      value: statsData.clientesActivos, 
      subValue: `${statsData.clientesVencidos} vencidas`, 
      icon: Users, 
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      trend: `${statsData.tasaRetencion}% retención`,
      trendColor: 'text-emerald-500'
    },
    { 
      name: 'Ingresos del Mes', 
      value: currencyFormatter.format(statsData.ingresosMes), 
      subValue: `Hoy: ${currencyFormatter.format(statsData.ingresosDia)}`, 
      icon: DollarSign, 
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      trend: statsData.ingresosTrend + ' vs mes ant.',
      trendColor: 'text-emerald-500'
    },
    { 
      name: 'Aforo en Sala', 
      value: statsData.aforoActual, 
      subValue: `Total hoy: ${statsData.asistenciasHoy}`, 
      icon: Activity, 
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
      trend: 'Pico: 18:00',
      trendColor: 'text-zinc-400'
    },
    { 
      name: 'Saldo en Caja', 
      value: currencyFormatter.format(statsData.saldoCaja), 
      subValue: 'Caja actual abierta', 
      icon: CreditCard, 
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      trend: 'Estable',
      trendColor: 'text-zinc-400'
    }
  ]

  return (
    <div className="relative max-w-[1600px] mx-auto space-y-6 md:space-y-10 pb-20 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px] -z-10" />

      <DashboardHeader gymName={gymData?.nombre} />

      {/* Caja Closed Alert */}
      {!statsData.cajaAbierta && (
        <div className="bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-blue-600/20 border-y border-blue-500/30 backdrop-blur-sm py-8 px-4 text-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-700 rounded-3xl border">
          <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20 shadow-2xl">
            <CreditCard className="w-8 h-8 text-blue-400 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">¡Hola, {gymData?.nombre}!</h2>
            <p className="text-zinc-400 font-medium max-w-lg mx-auto">
              Para comenzar a registrar pagos y ventas hoy, primero debes realizar la apertura de tu caja principal.
            </p>
          </div>
          <Link href="/caja">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest px-10 h-14 rounded-2xl shadow-xl shadow-blue-500/20 group">
              Abrir Caja Ahora
              <ArrowUpRight className="ml-2 w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Button>
          </Link>
        </div>
      )}

      {/* KPI Grid */}

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {mainStats.map((stat, index) => (
          <Card 
            key={stat.name} 
            glass
            className="group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:bg-white/[0.08] animate-in-slide"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-5">
              <CardTitle className="text-[12px] font-bold text-zinc-400 uppercase tracking-[0.1em]">{stat.name}</CardTitle>
              <div className={cn("p-2 rounded-xl transition-colors group-hover:scale-110", stat.bg)}>
                <stat.icon className={cn("size-4", stat.color)} />
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-5 pt-0">
              <div className="text-lg md:text-3xl font-black tracking-tight text-white mb-1 leading-none">{stat.value}</div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-2">
                <span className="text-[9px] md:text-[12px] text-zinc-500 font-medium truncate">{stat.subValue}</span>
                <span className={cn(
                  "text-[11px] px-2 py-0.5 rounded-full font-bold bg-zinc-800/80 border border-white/5", 
                  stat.trendColor
                )}>
                  {stat.trend}
                </span>
              </div>
            </CardContent>
            {/* Subtle hover line */}
            <div className={cn("absolute bottom-0 left-0 h-[2px] w-0 transition-all duration-500 group-hover:w-full", stat.color.replace('text', 'bg'))} />
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Gráfica de Asistencia - Principal */}
        <Card glass className="lg:col-span-2 animate-in-slide shadow-2xl" style={{ animationDelay: '400ms' }}>
          <CardHeader className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg md:text-xl font-bold text-white">Flujo de Asistencia</CardTitle>
                <CardDescription className="text-zinc-500 font-medium">Actividad registrada en los últimos 7 días</CardDescription>
              </div>
              <div className="flex items-center space-x-2 text-[12px] font-bold bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded-full border border-emerald-500/20">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{chartsData.asistenciaTrend} incremento</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-2 md:p-8 pt-0 h-[350px]">
            <AttendanceChart data={chartsData.chartAsistencia} />
          </CardContent>
        </Card>

        {/* Sidebar Widgets */}
        <div className="flex flex-col gap-6 animate-in-slide" style={{ animationDelay: '500ms' }}>
          {/* Alertas Críticas */}
          <Card className="border-none bg-gradient-to-br from-orange-500/20 to-rose-500/10 backdrop-blur-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
              <AlertTriangle className="size-12 text-orange-500" />
            </div>
            <CardHeader className="p-5 pb-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <CardTitle className="text-xs font-black text-orange-200 uppercase tracking-widest">Alertas Prioritarias</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-2">
              <Link href="/clientes?tab=por_vencer" className="flex flex-col p-2.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer border border-border group/item">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-orange-500/20">
                      <Clock className="size-4 text-orange-500 dark:text-orange-400" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-orange-700 dark:text-orange-100">{statsData.vencimientos2d} Por vencer</p>
                      <p className="text-[11px] text-orange-600/80 dark:text-orange-500/70 font-medium">Próximos 2 días</p>
                    </div>
                  </div>
                  <ArrowUpRight className="size-4 text-orange-500 group-hover/item:translate-x-0.5 group-hover/item:-translate-y-0.5 transition-transform" aria-hidden="true" />
                </div>
                {statsData.detalleVencimientos?.length > 0 && (
                  <div className="space-y-1 pl-4 md:pl-11 border-l border-orange-500/10 ml-1 md:ml-4 mt-2">
                    {statsData.detalleVencimientos.map((v: { nombre: string; fecha_fin: string }, i: number) => (
                      <div key={i} className="flex items-center justify-between gap-1">
                        <p className="text-[9px] md:text-[11px] text-orange-600/80 dark:text-orange-400/60 font-bold truncate">
                          • {v.nombre}
                        </p>
                        <span className="text-[9px] md:text-[11px] text-orange-500/50 font-mono shrink-0">{v.fecha_fin}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Link>

              <Link href="/clientes?tab=vencidos" className="flex flex-col p-2.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer border border-border group/item">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-rose-500/20">
                      <AlertTriangle className="size-4 text-rose-500 dark:text-rose-400" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-rose-700 dark:text-rose-100">{statsData.clientesVencidos} Vencidos</p>
                      <p className="text-[11px] text-rose-600/80 dark:text-rose-500/70 font-medium">Acción inmediata</p>
                    </div>
                  </div>
                  <ArrowUpRight className="size-4 text-rose-500 group-hover/item:translate-x-0.5 group-hover/item:-translate-y-0.5 transition-transform" aria-hidden="true" />
                </div>
                {statsData.detalleVencidos?.length > 0 && (
                  <div className="space-y-1 pl-4 md:pl-11 border-l border-rose-500/10 ml-1 md:ml-4 mt-2">
                    {statsData.detalleVencidos.map((v: { nombre: string; fecha_fin: string }, i: number) => (
                      <div key={i} className="flex items-center justify-between gap-1">
                        <p className="text-[9px] md:text-[11px] text-rose-600/80 dark:text-rose-400/60 font-bold truncate">
                          • {v.nombre}
                        </p>
                        <span className="text-[9px] md:text-[11px] text-rose-500/50 font-mono shrink-0">{v.fecha_fin}</span>
                      </div>
                    ))}
                    {statsData.clientesVencidos > 5 && (
                      <p className="text-[11px] text-rose-500/40 italic pl-2 pt-1">
                        + {statsData.clientesVencidos - 5} más...
                      </p>
                    )}
                  </div>
                )}
              </Link>
            </CardContent>
          </Card>

          {/* Clases del Día */}
          {clasesHoy.length > 0 && (
            <Card className="glass-card overflow-hidden">
              <CardHeader className="p-5 pb-2 border-b border-white/5 bg-white/[0.02]">
                <CardTitle className="text-[11px] font-bold flex items-center gap-2 uppercase tracking-widest text-zinc-400">
                  <Calendar className="size-4 text-primary" aria-hidden="true" />
                  Programación Hoy
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-4">
                <div className="space-y-3">
                  {clasesHoy.map((clase) => (
                    <Link href="/clases" key={clase.id} className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-zinc-900/40 hover:bg-zinc-800/40 transition-colors">
                      <div className="space-y-1 overflow-hidden">
                        <p className="text-[12px] font-bold text-white truncate">{clase.nombre}</p>
                        <div className="flex items-center gap-2 text-[11px] font-medium text-zinc-500">
                          <Clock className="w-3 h-3" aria-hidden="true" />
                          {clase.hora_inicio.substring(0, 5)} hs
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="flex items-center justify-end gap-1.5 mb-1.5">
                          <span className="text-[12px] font-black text-zinc-200">{clase.inscritos}</span>
                          <span className="text-[11px] font-bold text-zinc-600">/ {clase.cupo_maximo}</span>
                        </div>
                        <div className="w-12 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div className={cn(
                              "h-full transition-all duration-1000",
                              (clase.inscritos / (clase.cupo_maximo || 1)) > 0.8 ? "bg-rose-500" : "bg-primary"
                            )} 
                            style={{ width: `${(clase.inscritos / (clase.cupo_maximo || 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Exoneraciones Recientes */}
          {exoneraciones.length > 0 && (
            <Card className="glass-card overflow-hidden">
              <CardHeader className="p-5 pb-2 border-b border-white/5 bg-white/[0.02]">
                <CardTitle className="text-[11px] font-bold flex items-center gap-2 uppercase tracking-widest text-zinc-400">
                  <ShieldCheck className="size-4 text-emerald-500" aria-hidden="true" />
                  Exoneraciones
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-4">
                <div className="space-y-3">
                  {exoneraciones.map((item: any) => (
                    <div key={item.id} className="p-3 rounded-xl border border-white/5 bg-zinc-900/40 space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black text-emerald-500">+{item.dias_compensados} DÍAS</span>
                        <span className="text-[9px] font-bold text-zinc-600 uppercase">
                          {new Date(item.creado_en).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 font-medium line-clamp-1 italic">
                        "{item.descripcion}"
                      </p>
                    </div>
                  ))}
                </div>
                <Link href="/exoneraciones">
                  <Button variant="ghost" className="w-full mt-4 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 h-8">
                    Ver Todo el Historial
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Distribución de Ingresos */}
        <Card glass className="animate-in-slide" style={{ animationDelay: '600ms' }}>
          <CardHeader className="p-6">
            <CardTitle className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Ingresos por Plan</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 h-[300px]">
            <MembershipPieChart data={chartsData.chartPlanes} />
          </CardContent>
        </Card>

        {/* Últimas Asistencias */}
        <Card glass className="lg:col-span-2 animate-in-slide" style={{ animationDelay: '700ms' }}>
          <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
            <div>
              <CardTitle className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Última Actividad</CardTitle>
            </div>
            <Activity className="size-4 text-primary animate-pulse" aria-hidden="true" />
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <RecentActivityClient initialAsistencias={asistencias} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import { GymLoading } from '@/components/shared/GymLoading'

export default async function DashboardPage() {
  const { isGymActive, isLicenseExpired, gymData } = await requireAuth()
  
  return (
    <AdminLayout 
      isGymActive={isGymActive} 
      vencimientoLicencia={gymData?.vencimiento_licencia} 
      gymName={gymData?.nombre}
    >
      <Suspense fallback={<GymLoading message="Preparando tu entrenamiento..." />}>
        <DashboardContent />
      </Suspense>
    </AdminLayout>
  )
}
