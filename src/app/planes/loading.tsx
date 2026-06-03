import React from 'react'
import { Card } from '@/components/ui/card'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <AdminLayout>
      <div className="space-y-6 md:space-y-10 pb-20">
        <div className="flex flex-col gap-6 md:flex-row md:items-end justify-between mb-8">
          <div className="space-y-3">
            <Skeleton className="h-10 w-72 bg-white/5" />
            <Skeleton className="h-4 w-[400px] bg-white/5" />
          </div>
          <Skeleton className="h-11 w-40 bg-white/5 rounded-xl" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} glass className="overflow-hidden p-6 rounded-2xl">
              <div className="flex items-start justify-between mb-6">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40 bg-white/10" />
                  <Skeleton className="h-3 w-24 bg-white/5" />
                </div>
                <Skeleton className="h-10 w-10 rounded-xl bg-white/10" />
              </div>
              <div className="space-y-3 mb-6">
                <Skeleton className="h-8 w-28 bg-white/10" />
                <Skeleton className="h-3 w-32 bg-white/5" />
              </div>
              <Skeleton className="h-10 w-full bg-white/5 rounded-xl" />
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
