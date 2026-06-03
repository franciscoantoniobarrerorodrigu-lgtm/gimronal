'use client'

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { formatCOP } from '@/lib/format-utils'

interface InventarioChartProps {
  data: any[]
}

export default function InventarioChart({ data }: InventarioChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 30, top: 0, bottom: 0 }}>
        <XAxis type="number" tick={{ fill: '#666', fontSize: 9 }} axisLine={false} tickLine={false} />
        <YAxis 
          dataKey="nombre" 
          type="category" 
          width={100} 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#888', fontSize: 10, fontWeight: 'bold' }} 
        />
        <Tooltip 
          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-black/80 border border-white/10 p-2 rounded-lg backdrop-blur-md shadow-2xl">
                  <p className="text-[10px] font-black text-white uppercase">{payload[0].payload.nombre}</p>
                  <p className="text-sm font-black text-primary">{formatCOP(payload[0].value as number)}</p>
                  <p className="text-[9px] text-muted-foreground italic">{payload[0].payload.cantidad} unidades vendidas</p>
                </div>
              )
            }
            return null
          }}
        />
        <Bar 
          dataKey="total" 
          fill="#ff5a00"
          radius={[0, 4, 4, 0]} 
          barSize={20} 
          minPointSize={10}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
