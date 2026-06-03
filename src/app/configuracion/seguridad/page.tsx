import React, { Suspense } from 'react'
import { getGymUsers } from '@/lib/supabase/actions/gimnasio'
import SeguridadClient from './SeguridadClient'
import { Loader2 } from 'lucide-react'
import { AdminLayout } from '@/components/layout/AdminLayout'

export const dynamic = 'force-dynamic'

async function SeguridadContent() {
  const users = await getGymUsers()
  
  return <SeguridadClient initialUsers={users} />
}

export default function SeguridadPage() {
  return (
    <Suspense fallback={
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    }>
      <SeguridadContent />
    </Suspense>
  )
}
