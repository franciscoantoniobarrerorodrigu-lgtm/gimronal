'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ShieldAlert, ShieldCheck, AlertTriangle, TrendingUp, Info, ExternalLink } from 'lucide-react'
import { formatCOP } from '@/lib/format-utils'

interface RadarProps {
  data: {
    ingresosAnoActual: number
    topeUVT: number
    valorUVT2026: number
    topePesos: number
    porcentaje: number
    estado: string
    faltante: number
  } | null
}

export function RadarFiscalDIAN({ data }: RadarProps) {
  if (!data) return null

  const getStatusConfig = () => {
    switch (data.estado) {
      case 'excedido':
        return {
          badge: 'Tope Excedido (Obligado a Facturar Electrónicamente)',
          badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
          borderColor: 'border-rose-500/50 shadow-lg shadow-rose-500/10',
          gradient: 'from-rose-500/20 via-rose-600/10 to-transparent',
          progressBg: 'bg-rose-500 shadow-lg shadow-rose-500/50',
          icon: ShieldAlert,
          iconColor: 'text-rose-500 animate-pulse'
        }
      case 'alerta':
        return {
          badge: 'Alerta Fiscal (Cerca del Tope de 3.500 UVT)',
          badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
          borderColor: 'border-amber-500/50 shadow-lg shadow-amber-500/10',
          gradient: 'from-amber-500/20 via-amber-600/10 to-transparent',
          progressBg: 'bg-amber-500 shadow-lg shadow-amber-500/50',
          icon: AlertTriangle,
          iconColor: 'text-amber-500 animate-pulse'
        }
      default:
        return {
          badge: 'Régimen No Responsable de IVA (Margen Seguro)',
          badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          borderColor: 'border-white/5',
          gradient: 'from-blue-500/10 via-primary/5 to-transparent',
          progressBg: 'bg-primary shadow-lg shadow-primary/50',
          icon: ShieldCheck,
          iconColor: 'text-emerald-500'
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <Card className={`glass-card relative overflow-hidden transition-all duration-500 ${config.borderColor}`}>
      <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br ${config.gradient} pointer-events-none opacity-50`} />
      
      <CardHeader className="p-6 pb-4 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 bg-white/[0.02]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Icon className={`w-6 h-6 ${config.iconColor}`} />
            <CardTitle className="text-lg md:text-xl font-black italic tracking-tight text-white flex items-center gap-2">
              Radar Fiscal DIAN (Tope 3.500 UVT - 2026)
            </CardTitle>
          </div>
          <CardDescription className="text-zinc-400 font-medium max-w-2xl text-xs">
            Monitoreo en tiempo real de ingresos brutos acumulados en 2026 frente al límite tributario para personas naturales. Valor UVT 2026: <strong className="text-white">$52.374</strong>.
          </CardDescription>
        </div>
        <Badge variant="outline" className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest ${config.badgeColor} backdrop-blur-sm border`}>
          {config.badge}
        </Badge>
      </CardHeader>

      <CardContent className="p-6 relative z-10 space-y-6">
        <div className="grid gap-6 md:grid-cols-3 items-center">
          <div className="space-y-1 bg-zinc-900/60 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
            <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Ingresos Acumulados (2026)</span>
            <div className="text-2xl md:text-3xl font-black text-white">{formatCOP(data.ingresosAnoActual)}</div>
            <p className="text-[10px] text-zinc-400 font-medium">Suma de membresías y ventas</p>
          </div>

          <div className="space-y-1 bg-zinc-900/60 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
            <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Tope DIAN (3.500 UVT)</span>
            <div className="text-2xl md:text-3xl font-black text-zinc-200">{formatCOP(data.topePesos)}</div>
            <p className="text-[10px] text-emerald-400 font-bold">Tope Contratistas del Estado: 4.000 UVT</p>
          </div>

          <div className="space-y-1 bg-zinc-900/60 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
            <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Margen Fiscal Disponible</span>
            <div className={`text-2xl md:text-3xl font-black ${data.faltante === 0 ? 'text-rose-500' : 'text-primary'}`}>
              {formatCOP(data.faltante)}
            </div>
            <p className="text-[10px] text-zinc-400 font-medium">
              {data.faltante === 0 ? 'Límite superado en este periodo' : 'Antes de transición obligatoria'}
            </p>
          </div>
        </div>

        {/* Barra de Progreso */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-zinc-400">Progreso hacia el tope de 3.500 UVT:</span>
            <span className="text-white font-black font-mono text-sm">{data.porcentaje}%</span>
          </div>
          <div className="h-4 w-full bg-zinc-900 rounded-full overflow-hidden p-1 border border-white/10 shadow-inner">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${config.progressBg}`} 
              style={{ width: `${Math.min(100, data.porcentaje)}%` }}
            />
          </div>
        </div>

        {/* Recomendación Estratégica */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-primary/10 border border-blue-500/20">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-white uppercase tracking-wider">Normativa DIAN & Integración Factus</p>
              <p className="text-xs text-zinc-300">
                Al superar los 3.500 UVT, la ley exige cambiar a régimen de IVA y expedir Factura Electrónica. GymControl está listo para conectar con <strong className="text-white font-bold">Factus API</strong> para tu cumplimiento fiscal automatizado.
              </p>
            </div>
          </div>
          <a href="https://developers.factus.com.co/" target="_blank" rel="noopener noreferrer" className="shrink-0 w-full md:w-auto">
            <Button size="sm" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold tracking-wide shadow-lg shadow-blue-500/20">
              Conectar Factus DIAN
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
