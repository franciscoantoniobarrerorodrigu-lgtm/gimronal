'use client'

import React from 'react'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'

interface WeightChartProps {
  data: {
    timestamp: number;
    fecha: string;
    peso: number;
  }[]
}

export default function WeightChart({ data }: WeightChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground text-sm italic">
        Sin datos de peso registrados
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f97316" stopOpacity={0.15}/>
            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
        <XAxis dataKey="fecha" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
        <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ backgroundColor: '#000', borderColor: '#27272a' }} />
        <Area type="monotone" dataKey="peso" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorPeso)" dot={data.length <= 3 ? { r: 5, fill: '#f97316', stroke: '#f97316' } : false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
