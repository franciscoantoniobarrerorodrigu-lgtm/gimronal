import React, { Suspense } from 'react'
import { getGimnasio } from '@/lib/supabase/actions/gimnasio'
import GimnasioConfigClient from './GimnasioConfigClient'

export const dynamic = 'force-dynamic'

async function GimnasioConfigContent() {
  const gimnasio = await getGimnasio()
  
  return <GimnasioConfigClient initialGimnasio={gimnasio} />
}

export default function GimnasioConfigPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <GimnasioConfigContent />
    </Suspense>
  )
}
