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
            <Skeleton className="h-4 w-[400px] bg-white/5" />
          </div>
          <Skeleton className="h-11 w-40 bg-white/5 rounded-xl" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} glass className="overflow-hidden rounded-2xl">
              <Skeleton className="h-32 w-full bg-white/5" />
              <div className="p-5 space-y-3">
                <Skeleton className="h-5 w-44 bg-white/10" />
                <Skeleton className="h-3 w-32 bg-white/5" />
                <div className="flex items-center gap-4 pt-2">
                  <Skeleton className="h-3 w-20 bg-white/5" />
                  <Skeleton className="h-3 w-16 bg-white/5" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
