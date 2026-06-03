import React, { Suspense } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { getInventarioDashboard } from '@/lib/supabase/actions/inventario'
import { getCajaActiva } from '@/lib/supabase/actions/caja'
import InventarioClient from './InventarioClient'
import { GymLoading } from '@/components/shared/GymLoading'

export const dynamic = 'force-dynamic'

async function InventarioWrapper() {
  const [inventarioRes, cajaActiva] = await Promise.all([
    getInventarioDashboard(),
    getCajaActiva()
  ])

  const initialData = inventarioRes.success && inventarioRes.data 
    ? inventarioRes.data 
    : { productos: [], stats: { stockBajo: 0, valorTotal: 0, ventasMes: 0, ventasPorProducto: [] } }

  return (
    <InventarioClient 
      initialData={initialData} 
      initialCajaAbierta={!!cajaActiva} 
    />
  )
}

export default function InventarioPage() {
  return (
    <AdminLayout>
      <Suspense fallback={<GymLoading message="Cargando inventario..." />}>
        <InventarioWrapper />
      </Suspense>
    </AdminLayout>
  )
}
