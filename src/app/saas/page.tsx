import React from 'react'
import { SaaSLayout } from '@/components/layout/SaaSLayout'
import { getSaaSStats } from '@/lib/supabase/actions/saas'
import { 
  Building2, 
  Users, 
  TrendingUp, 
  Plus, 
  Calendar,
  ChevronRight,
  ShieldCheck,
  Zap,
  Mail,
  UserCheck,
  Activity,
  Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { GymActions } from './GymActions'
import { SerialesManager } from './SerialesManager'
import { Badge } from '@/components/ui/badge'

import { GymListClient } from './GymListClient'
import { RefreshButton } from './RefreshButton'

export const dynamic = 'force-dynamic'

export default async function SaaSPage() {
  const stats = await getSaaSStats()

  return (
    <SaaSLayout>
      <div className="relative space-y-12 pb-24 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[150px] -z-10 animate-pulse" />
        <div className="absolute bottom-0 right-[-5%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] -z-10" />

        {/* Ultra Modern Header Section */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 rounded-2xl sm:rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="relative flex flex-col xl:flex-row xl:items-center justify-between gap-8 bg-zinc-950/40 border border-white/5 p-5 sm:p-10 rounded-2xl sm:rounded-[2.5rem] backdrop-blur-3xl shadow-2xl overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 font-black tracking-[0.2em] text-[10px] px-4 py-1">
                  CORE INFRASTRUCTURE
                </Badge>
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-white leading-tight">
                Master <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Center</span>
              </h1>
              <p className="text-zinc-400 text-sm sm:text-base lg:text-lg font-medium max-w-xl italic">
                Control total sobre el ecosistema Gimronal. Supervisión de licencias, administración de sedes y monitoreo global de usuarios.
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-6 sm:gap-8 bg-white/[0.03] border border-white/5 px-6 sm:px-8 py-4 sm:py-5 rounded-3xl backdrop-blur-md w-full sm:w-auto justify-center sm:justify-start">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Gimnasios</span>
                  <span className="text-3xl sm:text-4xl font-black text-white leading-none">{stats.totalGyms}</span>
                </div>
                <div className="w-[1px] h-10 bg-white/10" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Cuentas</span>
                  <span className="text-3xl sm:text-4xl font-black text-white leading-none">{stats.totalUsers}</span>
                </div>
              </div>

              <Link href="/saas/gyms/new" className="w-full sm:w-auto">
                <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] h-14 sm:h-16 px-8 sm:px-10 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider transition-all hover:scale-105 active:scale-95 group">
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 group-hover:rotate-90 transition-transform" />
                  Nuevo Gimnasio
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Gym List Section */}
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/5">
                <Building2 className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight uppercase">Panel Maestro</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Sincronización en tiempo real</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <RefreshButton />
            </div>
          </div>

          <GymListClient initialGyms={stats.allGymsWithAdmins || []} />
        </div>
      </div>
    </SaaSLayout>
  )
}

