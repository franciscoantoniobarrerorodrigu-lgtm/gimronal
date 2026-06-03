import React from 'react'
import { Card } from '@/components/ui/card'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <AdminLayout>
      <div className="space-y-8 pb-20 max-w-3xl">
        <div className="space-y-3">
          <Skeleton className="h-10 w-64 bg-white/5" />
          <Skeleton className="h-4 w-[350px] bg-white/5" />
        </div>

        <Card className="border-border/50">
          <div className="p-6 border-b border-border/50">
            <Skeleton className="h-5 w-40 bg-white/10 mb-2" />
            <Skeleton className="h-3 w-56 bg-white/5" />
          </div>
          <div className="p-6 space-y-4">
            <Skeleton className="h-12 w-full bg-white/5 rounded-xl" />
            <Skeleton className="h-12 w-full bg-white/5 rounded-xl" />
            <Skeleton className="h-12 w-full bg-white/5 rounded-xl" />
          </div>
        </Card>

        <Card className="border-border/50">
          <div className="p-6 border-b border-border/50">
            <Skeleton className="h-5 w-48 bg-white/10 mb-2" />
            <Skeleton className="h-3 w-64 bg-white/5" />
          </div>
          <div className="p-6 space-y-4">
            <Skeleton className="h-24 w-full bg-white/5 rounded-xl" />
          </div>
        </Card>
      </div>
    </AdminLayout>
  )
}
