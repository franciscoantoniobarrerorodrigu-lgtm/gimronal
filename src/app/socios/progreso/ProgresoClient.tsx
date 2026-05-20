'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Scale, Ruler, Activity, Flame, Dumbbell, TrendingDown, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react'
import dynamic from 'next/dynamic'

const ResponsiveContainer = dynamic(() => import('recharts').then((mod) => mod.ResponsiveContainer), { ssr: false })
const LineChart = dynamic(() => import('recharts').then((mod) => mod.LineChart), { ssr: false })
const Line = dynamic(() => import('recharts').then((mod) => mod.Line), { ssr: false })
const XAxis = dynamic(() => import('recharts').then((mod) => mod.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then((mod) => mod.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import('recharts').then((mod) => mod.CartesianGrid), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), { ssr: false })

type Medida = {
  id: string
  fecha_medicion: string | null
  created_at: string | null
  peso: number | null
  estatura: number | null
  imc: number | null
  porcentaje_grasa: number | null
  masa_muscular: number | null
  pecho: number | null
  cintura: number | null
  cadera: number | null
  brazo_derecho: number | null
  brazo_izquierdo: number | null
  muslo_derecho: number | null
  muslo_izquierdo: number | null
  notas: string | null
}

type MetricKey = 'peso' | 'imc' | 'porcentaje_grasa' | 'masa_muscular'

const metricOptions: { key: MetricKey; label: string; unit: string; color: string; icon: any }[] = [
  { key: 'peso', label: 'Peso', unit: 'kg', color: '#f97316', icon: Scale },
  { key: 'imc', label: 'IMC', unit: '', color: '#3b82f6', icon: Activity },
  { key: 'porcentaje_grasa', label: '% Grasa', unit: '%', color: '#ef4444', icon: Flame },
  { key: 'masa_muscular', label: 'Masa Muscular', unit: 'kg', color: '#22c55e', icon: Dumbbell },
]

function getIMCCategory(imc: number | null): { label: string; color: string } {
  if (!imc) return { label: 'Sin datos', color: 'text-zinc-500' }
  if (imc < 18.5) return { label: 'Bajo peso', color: 'text-blue-400' }
  if (imc < 25) return { label: 'Normal', color: 'text-emerald-400' }
  if (imc < 30) return { label: 'Sobrepeso', color: 'text-amber-400' }
  return { label: 'Obesidad', color: 'text-red-400' }
}

function getDelta(medidas: Medida[], key: MetricKey): { value: number; isPositive: boolean } | null {
  if (medidas.length < 2) return null
  const last = medidas[medidas.length - 1][key]
  const prev = medidas[medidas.length - 2][key]
  if (last == null || prev == null) return null
  const delta = last - prev
  return { value: Math.abs(delta), isPositive: delta >= 0 }
}

export default function ProgresoClient({ medidas }: { medidas: Medida[] }) {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('peso')
  const [showAllHistory, setShowAllHistory] = useState(false)

  const latest = medidas.length > 0 ? medidas[medidas.length - 1] : null
  const chartData = medidas.map((m) => {
    const dateStr = m.fecha_medicion || m.created_at || new Date().toISOString()
    const cleanDateStr = dateStr.split('T')[0]
    return {
      fecha: format(new Date(cleanDateStr + 'T12:00:00'), 'dd MMM', { locale: es }),
      peso: m.peso,
      imc: m.imc,
      porcentaje_grasa: m.porcentaje_grasa,
      masa_muscular: m.masa_muscular,
    }
  })

  const currentMetricInfo = metricOptions.find((m) => m.key === selectedMetric)!
  const displayedHistory = showAllHistory ? medidas.slice().reverse() : medidas.slice().reverse().slice(0, 5)

  if (medidas.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 min-h-[50vh]">
        <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10">
          <Scale className="w-10 h-10 text-zinc-600" />
        </div>
        <h3 className="text-xl font-black text-white">Sin Mediciones Registradas</h3>
        <p className="text-sm text-zinc-500 max-w-sm">
          Aún no tienes medidas corporales registradas. Solicita a tu entrenador que registre tu primera medición para comenzar a rastrear tu progreso.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700">

      {/* Current Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {metricOptions.map((metric) => {
          const value = latest?.[metric.key]
          const delta = getDelta(medidas, metric.key)
          const Icon = metric.icon
          const isSelected = selectedMetric === metric.key

          return (
            <button
              key={metric.key}
              onClick={() => setSelectedMetric(metric.key)}
              className={`group relative text-left p-4 md:p-5 rounded-2xl border transition-all duration-300 ${
                isSelected
                  ? 'bg-white/[0.08] border-primary/40 shadow-lg shadow-primary/10 ring-1 ring-primary/20'
                  : 'bg-white/5 border-white/10 hover:bg-white/[0.06] hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-xl transition-colors ${isSelected ? 'bg-primary/20' : 'bg-white/5'}`}>
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-zinc-500'}`} />
                </div>
                {delta && (
                  <div className={`flex items-center gap-0.5 text-[10px] font-bold ${
                    metric.key === 'porcentaje_grasa'
                      ? delta.isPositive ? 'text-red-400' : 'text-emerald-400'
                      : metric.key === 'masa_muscular'
                      ? delta.isPositive ? 'text-emerald-400' : 'text-red-400'
                      : delta.isPositive ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {delta.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {delta.value.toFixed(1)}
                  </div>
                )}
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">{metric.label}</p>
              <p className="text-2xl md:text-3xl font-black text-white">
                {value != null ? value.toFixed(1) : '—'}
                <span className="text-sm font-bold text-zinc-500 ml-1">{metric.unit}</span>
              </p>
            </button>
          )
        })}
      </div>

      {/* IMC Classification Banner */}
      {latest?.imc && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20 flex-shrink-0">
            <Activity className="w-6 h-6 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Clasificación IMC</p>
            <p className={`text-lg font-black ${getIMCCategory(latest.imc).color}`}>
              {getIMCCategory(latest.imc).label}
              <span className="text-sm font-bold text-zinc-500 ml-2">({latest.imc.toFixed(1)})</span>
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[10px] text-zinc-600 font-bold uppercase">Estatura</p>
            <p className="text-base font-black text-white">{latest.estatura ? `${latest.estatura} cm` : '—'}</p>
          </div>
        </div>
      )}

      {/* Evolution Chart */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-5 md:p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-black text-white tracking-tight uppercase italic">Evolución de {currentMetricInfo.label}</h3>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-1">
              {medidas.length} mediciones registradas
            </p>
          </div>
          <div className="flex gap-1.5">
            {metricOptions.map((m) => (
              <button
                key={m.key}
                onClick={() => setSelectedMetric(m.key)}
                className={`w-3 h-3 rounded-full transition-all ${
                  selectedMetric === m.key ? 'scale-125 ring-2 ring-offset-2 ring-offset-zinc-900' : 'opacity-40 hover:opacity-70'
                }`}
                style={{ backgroundColor: m.color }}
                title={m.label}
              />
            ))}
          </div>
        </div>

        <div className="h-[280px] md:h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={currentMetricInfo.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={currentMetricInfo.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="fecha" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} fontWeight="bold" />
              <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} fontWeight="bold" domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#09090b',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                }}
                formatter={(value: any) => [`${Number(value).toFixed(1)} ${currentMetricInfo.unit}`, currentMetricInfo.label]}
              />
              <Line
                type="monotone"
                dataKey={selectedMetric}
                name={currentMetricInfo.label}
                stroke={currentMetricInfo.color}
                strokeWidth={3}
                dot={{ r: 5, strokeWidth: 3, fill: '#09090b' }}
                activeDot={{ r: 7, strokeWidth: 2 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Body Measurements Detail (latest) */}
      {latest && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-5 md:p-8 shadow-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl border border-primary/20 flex items-center justify-center">
              <Ruler className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-tight uppercase italic">Medidas Corporales</h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">
                Última medición: {format(new Date((latest.fecha_medicion || latest.created_at || new Date().toISOString()).split('T')[0] + 'T12:00:00'), "dd 'de' MMMM, yyyy", { locale: es })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[
              { label: 'Pecho', value: latest.pecho, unit: 'cm' },
              { label: 'Cintura', value: latest.cintura, unit: 'cm' },
              { label: 'Cadera', value: latest.cadera, unit: 'cm' },
              { label: 'Brazo Der.', value: latest.brazo_derecho, unit: 'cm' },
              { label: 'Brazo Izq.', value: latest.brazo_izquierdo, unit: 'cm' },
              { label: 'Muslo Der.', value: latest.muslo_derecho, unit: 'cm' },
              { label: 'Muslo Izq.', value: latest.muslo_izquierdo, unit: 'cm' },
            ].map((item) => (
              <div key={item.label} className="bg-black/40 border border-white/5 rounded-2xl p-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">{item.label}</p>
                <p className="text-xl font-black text-white">
                  {item.value != null ? item.value.toFixed(1) : '—'}
                  <span className="text-xs font-bold text-zinc-600 ml-1">{item.unit}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Measurement History */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-5 md:p-8 shadow-xl">
        <h3 className="text-lg font-black text-white tracking-tight uppercase italic mb-6">Historial de Mediciones</h3>
        <div className="space-y-3">
          {displayedHistory.map((m) => (
            <div key={m.id} className="flex items-center gap-4 bg-black/40 border border-white/5 rounded-2xl p-4 hover:border-primary/20 transition-colors">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-primary/20">
                <Scale className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">
                  {format(new Date((m.fecha_medicion || m.created_at || new Date().toISOString()).split('T')[0] + 'T12:00:00'), "dd 'de' MMMM, yyyy", { locale: es })}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                  {m.peso != null && <span className="text-[11px] text-zinc-400"><span className="font-bold text-zinc-300">{m.peso} kg</span> peso</span>}
                  {m.imc != null && <span className="text-[11px] text-zinc-400"><span className="font-bold text-zinc-300">{m.imc.toFixed(1)}</span> IMC</span>}
                  {m.porcentaje_grasa != null && <span className="text-[11px] text-zinc-400"><span className="font-bold text-zinc-300">{m.porcentaje_grasa}%</span> grasa</span>}
                  {m.masa_muscular != null && <span className="text-[11px] text-zinc-400"><span className="font-bold text-zinc-300">{m.masa_muscular} kg</span> músculo</span>}
                </div>
                {m.notas && <p className="text-[10px] text-zinc-600 mt-1 italic truncate">{m.notas}</p>}
              </div>
            </div>
          ))}
        </div>

        {medidas.length > 5 && (
          <button
            onClick={() => setShowAllHistory(!showAllHistory)}
            className="w-full mt-4 flex items-center justify-center gap-2 text-xs font-bold text-zinc-500 hover:text-primary py-3 transition-colors"
          >
            {showAllHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showAllHistory ? 'Mostrar menos' : `Ver todas las mediciones (${medidas.length})`}
          </button>
        )}
      </div>
    </div>
  )
}
