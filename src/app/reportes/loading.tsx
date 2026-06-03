import React from 'react'
import { Card } from '@/components/ui/card'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <AdminLayout>
      <div className="space-y-8 pb-20">
        <div className="flex flex-col gap-6 md:flex-row md:items-end justify-between mb-8">
          <div className="space-y-3">
            <Skeleton className="h-10 w-72 bg-white/5" />
            <Skeleton className="h-4 w-[450px] bg-white/5" />
          </div>
          <Skeleton className="h-11 w-44 bg-white/5 rounded-xl" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} glass className="p-6 rounded-2xl">
              <Skeleton className="h-4 w-24 bg-white/5 mb-3" />
              <Skeleton className="h-8 w-32 bg-white/10" />
              <Skeleton className="h-3 w-20 bg-white/5 mt-2" />
            </Card>
          ))}
        </div>

        <Card glass className="overflow-hidden rounded-2xl">
          <div className="p-6 border-b border-white/5">
            <Skeleton className="h-6 w-48 bg-white/10" />
            <Skeleton className="h-4 w-64 bg-white/5 mt-2" />
          </div>
          <div className="p-6 h-[400px] flex items-end gap-3">
            {[...Array(12)].map((_, i) => (
              <Skeleton key={i} className="flex-1 bg-white/5 rounded-t-lg"
                style={{ height: `${[60, 40, 75, 50, 90, 65, 45, 80, 55, 70, 40, 85][i]}%` }}
              />
            ))}
          </div>
        </Card>
      </div>
    </AdminLayout>
  )
}
