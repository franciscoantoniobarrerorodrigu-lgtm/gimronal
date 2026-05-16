'use client'

import React from 'react'
import { Plus, UserPlus, CreditCard, CheckCircle, Dumbbell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface DashboardHeaderProps {
  gymName?: string;
}

export function DashboardHeader({ gymName }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-in-fade">
      <div>
        <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-br from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent flex items-center gap-2 md:gap-3">
          <Dumbbell className="w-6 h-6 md:w-8 md:h-8 text-primary shrink-0 animate-pulse" />
          {gymName || "Dashboard Ejecutivo"}
        </h1>
        <p className="text-zinc-400 mt-1 text-xs md:text-base font-medium">
          Vista general del rendimiento del gimnasio hoy.
        </p>
      </div>
      
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="outline" className="bg-zinc-900/40 border-white/5 hover:bg-zinc-800/60 hover:border-white/10 transition-all text-xs h-10 px-4 backdrop-blur-sm">
          <Link href="/asistencia" className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 text-emerald-400" />
            Asistencia
          </Link>
        </Button>
        <Button asChild variant="outline" className="bg-zinc-900/40 border-white/5 hover:bg-zinc-800/60 hover:border-white/10 transition-all text-xs h-10 px-4 backdrop-blur-sm">
          <Link href="/clientes?nuevo=true" className="flex items-center">
            <UserPlus className="w-4 h-4 mr-2 text-blue-400" />
            Nuevo Cliente
          </Link>
        </Button>
        <Button asChild className="bg-orange-600 hover:bg-orange-500 text-white shadow-[0_0_20px_rgba(234,88,12,0.3)] hover:shadow-[0_0_25px_rgba(234,88,12,0.5)] transition-all text-xs h-10 px-6 font-bold">
          <Link href="/pagos" className="flex items-center">
            <CreditCard className="w-4 h-4 mr-2" />
            Registrar Pago
          </Link>
        </Button>
      </div>
    </div>
  )
}
