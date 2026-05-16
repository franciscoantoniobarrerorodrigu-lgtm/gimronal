import React, { Suspense } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { requireAuth } from '@/lib/supabase/server'
import { getMoraList, getMoraSummary } from '@/lib/supabase/actions/mora'
import MoraClient from './MoraClient'
import { Dumbbell } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function MoraContent() {
  const { isGymActive } = await requireAuth()
  
  if (!isGymActive) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-2xl font-bold">Gimnasio Inactivo</h2>
        <p className="text-muted-foreground">Debes tener un gimnasio activo para ver la mora.</p>
      </div>
    )
  }

  const initialData = await getMoraList()
  const summary = await getMoraSummary()

  return <MoraClient initialData={initialData} summary={summary} />
}

export default async function MoraPage() {
  const { isGymActive, gymData } = await requireAuth()

  return (
    <AdminLayout isGymActive={isGymActive} gymName={gymData?.nombre}>
      <Suspense fallback={
        <div className="h-96 flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
            <Dumbbell className="w-12 h-12 text-primary animate-bounce relative z-10" />
          </div>
          <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px] animate-pulse">
            Calculando saldos pendientes...
          </p>
        </div>
      }>
        <MoraContent />
      </Suspense>
    </AdminLayout>
  )
}
