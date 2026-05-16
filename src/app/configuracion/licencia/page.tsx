import React from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { getMyGymLicense } from '@/lib/supabase/actions/licencias'
import { LicenciaClient } from './LicenciaClient'
import { SectionHeader } from '@/components/shared/SectionHeader'

export default async function LicenciaPage() {
  const licenseData = await getMyGymLicense()

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-2xl mx-auto">
        <SectionHeader 
          title="Licencia y Suscripción" 
          subtitle="Gestiona el estado de tu suscripción y activa nuevos seriales."
        />
        
        <LicenciaClient initialData={licenseData} />
      </div>
    </AdminLayout>
  )
}
