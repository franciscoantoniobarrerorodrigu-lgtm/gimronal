import { AdminLayout } from '@/components/layout/AdminLayout'
import { GymLoading } from '@/components/shared/GymLoading'

export default function Loading() {
  return (
    <AdminLayout>
      <GymLoading message="Cargando Exoneraciones..." />
    </AdminLayout>
  )
}
