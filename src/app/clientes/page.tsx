import React, { Suspense } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { getClientes } from '@/lib/supabase/actions/clientes'
import ClientesClient from './ClientesClient'

import { requireAuth } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

async function ClientesListWrapper() {
  const clientesRes = await getClientes()
  const initialClients = clientesRes.success && clientesRes.data ? clientesRes.data : []
  return <ClientesClient initialClients={initialClients} />
}

export default async function ClientesPage() {
  const { isGymActive, gymData } = await requireAuth()
  
  return (
    <AdminLayout isGymActive={isGymActive} gymName={gymData?.nombre}>
      <Suspense fallback={<div className="h-96 flex items-center justify-center">Cargando clientes...</div>}>
        <ClientesListWrapper />
      </Suspense>
    </AdminLayout>
  )
}
