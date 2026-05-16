'use client'

import React from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'

interface MembershipPieChartProps {
  data: { name: string; value: number }[]
}

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#a855f7', '#f43f5e']

export function MembershipPieChart({ data }: MembershipPieChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground italic">
        Sin datos de ingresos por plan
      </div>
    )
  }

  return (
    <div className="h-[250px] md:h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#09090b', 
              borderColor: '#27272a',
              borderRadius: '8px',
              fontSize: '12px'
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            formatter={(value) => <span className="text-[10px] text-zinc-400">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
