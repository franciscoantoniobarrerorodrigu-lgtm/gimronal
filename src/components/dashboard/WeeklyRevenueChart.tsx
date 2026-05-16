'use client'

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'

interface WeeklyRevenueChartProps {
  data: {
    name: string
    monto: number
    fechaCompleta: string
  }[]
}

export function WeeklyRevenueChart({ data }: WeeklyRevenueChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(value)
  }

  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#888', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            hide
          />
          <Tooltip
            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-background border border-border p-3 rounded-lg shadow-xl">
                    <p className="text-xs text-muted-foreground mb-1">{payload[0].payload.fechaCompleta}</p>
                    <p className="text-sm font-bold text-primary">
                      {formatCurrency(Number(payload[0].value))}
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <Bar 
            dataKey="monto" 
            radius={[4, 4, 0, 0]}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={index === data.length - 1 ? '#f97316' : '#ea580c'} 
                fillOpacity={index === data.length - 1 ? 1 : 0.6}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
