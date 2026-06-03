import React, { Suspense } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { getPagos } from '@/lib/supabase/actions/pagos'
import { getGimnasio } from '@/lib/supabase/actions/gimnasio'
import { getCajaActiva } from '@/lib/supabase/actions/caja'
import { requireAuth } from '@/lib/supabase/server'
import PagosClient from './PagosClient'
import { GymLoading } from '@/components/shared/GymLoading'

export const dynamic = 'force-dynamic'

async function PagosWrapper() {
  const [pagos, cajaActiva, gimnasio] = await Promise.all([
    getPagos(),
    getCajaActiva(),
    getGimnasio()
  ])
  
  return (
    <PagosClient 
      initialPagos={pagos || []} 
      initialCajaAbierta={!!cajaActiva} 
      initialGimnasio={gimnasio} 
    />
  )
}

export default async function PagosPage() {
  const { isGymActive, gymData } = await requireAuth()
  return (
    <AdminLayout isGymActive={isGymActive} gymName={gymData?.nombre} vencimientoLicencia={gymData?.vencimiento_licencia}>
      <Suspense fallback={<GymLoading message="Cargando pagos..." />}>
        <PagosWrapper />
      </Suspense>
    </AdminLayout>
  )
}
