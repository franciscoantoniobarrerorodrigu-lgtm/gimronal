import React from 'react'
import { Dumbbell } from 'lucide-react'

interface GymLoadingProps {
  message?: string
}

export function GymLoading({ message = 'Cargando...' }: GymLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-in fade-in duration-300">
      <div className="relative">
        {/* Glow ring */}
        <div className="absolute inset-0 w-20 h-20 bg-primary/20 rounded-full blur-xl animate-pulse" />
        {/* Icon container */}
        <div className="relative w-20 h-20 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/10">
          <Dumbbell className="w-10 h-10 text-primary animate-spin" style={{ animationDuration: '2s' }} />
        </div>
      </div>
      <div className="text-center space-y-2">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-zinc-500">{message}</p>
        <div className="flex justify-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}
