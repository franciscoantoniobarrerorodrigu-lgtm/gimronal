import React, { Suspense } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { getAsistenciaHoy } from '@/lib/supabase/actions/asistencia'
import { getGimnasio } from '@/lib/supabase/actions/gimnasio'
import AsistenciaClient from './AsistenciaClient'
import { Skeleton } from '@/components/ui/skeleton'
import { Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function AsistenciaWrapper() {
  const [registros, gymInfo] = await Promise.all([
    getAsistenciaHoy(),
    getGimnasio()
  ])

  return (
    <AsistenciaClient initialRegistros={registros} initialGymInfo={gymInfo} />
  )
}

function AsistenciaLoading() {
  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-10 pb-20 animate-in-fade">
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter text-foreground uppercase italic break-words">
            Control de <span className="text-primary drop-shadow-[0_0_15px_rgba(255,90,0,0.3)]">Asistencia</span>
          </h1>
          <p className="text-zinc-500 text-sm md:text-base font-bold uppercase tracking-widest opacity-80">
            Cargando...
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-5 flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-2xl bg-zinc-800" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-20 bg-zinc-800" />
                <Skeleton className="h-6 w-12 bg-zinc-800" />
              </div>
            </div>
          ))}
        </div>

        <div className="relative bg-zinc-900/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-5 md:p-8 shadow-2xl">
           <Skeleton className="h-16 w-full rounded-full bg-zinc-800" />
        </div>

        <div className="flex flex-col gap-4">
           <Skeleton className="h-[400px] w-full rounded-[2.5rem] bg-zinc-800/50" />
        </div>
      </div>
    </AdminLayout>
  )
}

export default function AsistenciaPage() {
  return (
    <Suspense fallback={<AsistenciaLoading />}>
      <AsistenciaWrapper />
    </Suspense>
  )
}
