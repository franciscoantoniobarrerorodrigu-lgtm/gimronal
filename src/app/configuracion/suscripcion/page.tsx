import React, { Suspense } from 'react'
import { getGimnasio } from '@/lib/supabase/actions/gimnasio'
import SuscripcionClient from './SuscripcionClient'
import { Loader2 } from 'lucide-react'
import { AdminLayout } from '@/components/layout/AdminLayout'

export const dynamic = 'force-dynamic'

async function SuscripcionContent() {
  const gymInfo = await getGimnasio()
  
  return <SuscripcionClient initialGymInfo={gymInfo} />
}

export default function SuscripcionDianPage() {
  return (
    <Suspense fallback={
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    }>
      <SuscripcionContent />
    </Suspense>
  )
}
