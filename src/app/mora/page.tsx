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

import { GymLoading } from '@/components/shared/GymLoading'

export default async function MoraPage() {
  const { isGymActive, gymData } = await requireAuth()

  return (
    <AdminLayout isGymActive={isGymActive} gymName={gymData?.nombre}>
      <Suspense fallback={<GymLoading message="Calculando saldos pendientes..." />}>
        <MoraContent />
      </Suspense>
    </AdminLayout>
  )
}
