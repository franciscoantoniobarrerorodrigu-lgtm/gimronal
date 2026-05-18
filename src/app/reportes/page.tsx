'use client'

import React from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { 
  BarChart3, 
  Download, 
  FileSpreadsheet, 
  TrendingUp, 
  TrendingDown,
  Dumbbell,
  PieChart as PieIcon
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { generateReportPDF } from '@/lib/pdf-utils'
import { formatCOP } from '@/lib/format-utils'
import { getReporteFinanciero } from '@/lib/supabase/actions/reportes'
import dynamicImport from 'next/dynamic'

const BarChart = dynamicImport(() => import('recharts').then((mod) => mod.BarChart), { ssr: false })
const Bar = dynamicImport(() => import('recharts').then((mod) => mod.Bar), { ssr: false })
const AreaChart = dynamicImport(() => import('recharts').then((mod) => mod.AreaChart), { ssr: false })
const Area = dynamicImport(() => import('recharts').then((mod) => mod.Area), { ssr: false })
const XAxis = dynamicImport(() => import('recharts').then((mod) => mod.XAxis), { ssr: false })
const YAxis = dynamicImport(() => import('recharts').then((mod) => mod.YAxis), { ssr: false })
const CartesianGrid = dynamicImport(() => import('recharts').then((mod) => mod.CartesianGrid), { ssr: false })
const Tooltip = dynamicImport(() => import('recharts').then((mod) => mod.Tooltip), { ssr: false })
const ResponsiveContainer = dynamicImport(() => import('recharts').then((mod) => mod.ResponsiveContainer), { ssr: false })
const PieChart = dynamicImport(() => import('recharts').then((mod) => mod.PieChart), { ssr: false })
const Cell = dynamicImport(() => import('recharts').then((mod) => mod.Cell), { ssr: false })
const Pie = dynamicImport(() => import('recharts').then((mod) => mod.Pie), { ssr: false })
import { SectionHeader } from '@/components/shared/SectionHeader'
import { Badge } from '@/components/ui/badge'
import { GymLoading } from '@/components/shared/GymLoading'
import { Users, CreditCard, Activity, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function ReportesPage() {
  const [loading, setLoading] = React.useState(true)
  const [reporte, setReporte] = React.useState<any>(null)

  React.useEffect(() => {
    const fetchReporte = async () => {
      setLoading(true)
      const data = await getReporteFinanciero()
      setReporte(data)
      setLoading(false)
    }
    fetchReporte()
  }, [])


  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 md:gap-10 pb-20 animate-in-fade">
        <SectionHeader 
          title="Dashboard de Inteligencia" 
          subtitle="Análisis profundo del rendimiento financiero y operativo de tu gimnasio."
        >
          <Button variant="outline" className="border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 text-zinc-300">
            <FileSpreadsheet className="size-4 mr-2" />
            Excel
          </Button>
          <Button 
            className="bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
            disabled={loading || !reporte}
            onClick={() => {
              if (!reporte) return
              const columns = ['Métrica', 'Valor']
              const data = [
                ['Ingresos Totales', formatCOP(reporte.ingresosTotales)],
                ['Utilidad Neta', formatCOP(reporte.utilidadNeta)],
                ['Clientes Activos', reporte.statsMembresias.activas.toString()],
                ['Ticket Promedio', formatCOP(reporte.ticketPromedio)]
              ]
              generateReportPDF('Resumen Ejecutivo del Gimnasio', columns, data)
            }}
          >
            <Download className="size-4 mr-2" />
            Exportar PDF
          </Button>
        </SectionHeader>

        {loading ? (
          <GymLoading message="Sincronizando base de datos..." />
        ) : reporte && (
          <div className="space-y-8">
            {/* Master Stats Grid */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="glass-card border-white/5 hover:bg-white/[0.08] transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <TrendingUp className="w-12 h-12 text-emerald-500" />
                </div>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Ingresos Totales</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-black text-white">{formatCOP(reporte.ingresosTotales)}</div>
                  <div className={`flex items-center text-[10px] font-bold mt-1 ${reporte.comparativaMensual >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {reporte.comparativaMensual >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                    {Math.abs(reporte.comparativaMensual).toFixed(1)}% vs mes ant.
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/5 hover:bg-white/[0.08] transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Users className="w-12 h-12 text-blue-500" />
                </div>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Clientes Activos</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-black text-white">{reporte.statsMembresias.activas}</div>
                  <div className="text-[10px] text-zinc-500 font-bold mt-1">
                    <span className="text-rose-400">{reporte.statsMembresias.vencidas}</span> vencidos este año
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/5 hover:bg-white/[0.08] transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Zap className="w-12 h-12 text-amber-500" />
                </div>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Por Vencer (3d)</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-black text-amber-500">{reporte.statsMembresias.porVencer}</div>
                  <div className="text-[10px] text-zinc-500 font-bold mt-1">Oportunidad de renovación</div>
                </CardContent>
              </Card>

              <Card className="glass-card bg-primary/10 border-primary/20 hover:bg-primary/20 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <CreditCard className="w-12 h-12 text-primary" />
                </div>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-primary/80">Ticket Promedio</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-black text-primary">{formatCOP(reporte.ticketPromedio)}</div>
                  <div className="text-[10px] text-primary/60 font-bold mt-1">Eficiencia por cliente</div>
                </CardContent>
              </Card>
            </div>

            {/* Main Charts Row */}
            <div className="grid gap-6 md:grid-cols-3">
              {/* Ingresos vs Gastos (2/3 width) */}
              <Card className="glass-card border-white/5 overflow-hidden md:col-span-2">
                <CardHeader className="p-6 pb-2 border-b border-white/5 bg-white/[0.02] flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold italic flex items-center gap-2 text-white">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      Flujo de Caja Mensual
                    </CardTitle>
                    <CardDescription className="text-[11px] font-medium text-zinc-500">Histórico de ingresos y gastos de los últimos 6 meses.</CardDescription>
                  </div>
                  <Badge variant="outline" className="border-emerald-500/20 text-emerald-500 bg-emerald-500/5">Saludable</Badge>
                </CardHeader>
                <CardContent className="p-6 pt-6 h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reporte.graficoVentas} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis 
                        dataKey="mes" 
                        stroke="#71717a" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false} 
                        fontWeight="bold"
                      />
                      <YAxis 
                        stroke="#71717a" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(value) => `$${(value/1000)}k`} 
                        fontWeight="bold"
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#09090b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        itemStyle={{ fontWeight: 'bold' }}
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        formatter={(value: any) => formatCOP(Number(value || 0))} 
                      />
                      <Bar dataKey="ingresos" name="Ingresos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={24} />
                      <Bar dataKey="gastos" name="Gastos" fill="#27272a" radius={[4, 4, 0, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Métodos de Pago (1/3 width) */}
              <Card className="glass-card border-white/5 overflow-hidden">
                <CardHeader className="p-6 pb-2 border-b border-white/5 bg-white/[0.02]">
                  <CardTitle className="text-base font-bold italic flex items-center gap-2 text-white">
                    <PieIcon className="w-5 h-5 text-emerald-500" />
                    Métodos de Pago
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-6 h-[350px] flex flex-col items-center justify-between">
                  <div className="w-full h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={reporte.dataMetodos}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={8}
                          dataKey="value"
                        >
                          {reporte.dataMetodos.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#09090b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full space-y-2 mt-4">
                    {reporte.dataMetodos.slice(0, 4).map((m: any) => (
                      <div key={m.name} className="flex items-center justify-between group">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                          <span className="text-[11px] font-bold text-zinc-300">{m.name}</span>
                        </div>
                        <span className="text-[11px] font-black text-zinc-500">{m.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Occupation and Insights */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Ocupación por Horas */}
              <Card className="glass-card border-white/5 overflow-hidden">
                <CardHeader className="p-6 pb-2 border-b border-white/5 bg-white/[0.02]">
                  <CardTitle className="text-base font-bold italic flex items-center gap-2 text-white">
                    <Activity className="w-5 h-5 text-blue-500" />
                    Ocupación del Gimnasio (Hoy)
                  </CardTitle>
                  <CardDescription className="text-[11px] font-medium text-zinc-500">Flujo de personas por cada hora operativa.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-6 h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={reporte.ocupacionHoy} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorOcupacion" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="hora" stroke="#71717a" fontSize={9} tickLine={false} axisLine={false} />
                      <YAxis stroke="#71717a" fontSize={9} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#09090b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="personas" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorOcupacion)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Insights Inteligentes */}
              <Card className="glass-card border-white/5 overflow-hidden">
                <CardHeader className="p-6 pb-2 border-b border-white/5 bg-white/[0.02]">
                  <CardTitle className="text-base font-bold italic flex items-center gap-2 text-white">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Insights Operativos
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                    <TrendingUp className="w-4 h-4 text-emerald-500 mt-1" />
                    <div>
                      <p className="text-xs font-bold text-emerald-500">Crecimiento en Ingresos</p>
                      <p className="text-[10px] text-emerald-500/70">Tus ingresos subieron un {reporte.comparativaMensual.toFixed(1)}% este mes. ¡Sigue así!</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                    <Zap className="w-4 h-4 text-amber-500 mt-1" />
                    <div>
                      <p className="text-xs font-bold text-amber-500">Acción Requerida: Renovaciones</p>
                      <p className="text-[10px] text-amber-500/70">Tienes {reporte.statsMembresias.porVencer} clientes por vencer en los próximos 3 días. Contáctalos.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                    <Users className="w-4 h-4 text-blue-500 mt-1" />
                    <div>
                      <p className="text-xs font-bold text-blue-500">Pico de Asistencia</p>
                      <p className="text-[10px] text-blue-500/70">La hora más concurrida hoy fue a las {reporte.ocupacionHoy.sort((a: any, b: any) => b.personas - a.personas)[0]?.hora || 'N/A'}.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
