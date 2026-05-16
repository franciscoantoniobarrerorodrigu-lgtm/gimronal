'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  children?: React.ReactNode
  className?: string
}

export function SectionHeader({ title, subtitle, children, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-in-fade", className)}>
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-br from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
          {title}
        </h1>
        {subtitle && (
          <p className="text-zinc-400 mt-1.5 text-sm md:text-base font-medium">
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {children}
      </div>
    </div>
  )
}
