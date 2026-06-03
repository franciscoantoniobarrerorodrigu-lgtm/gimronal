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
            <Card key={i} glass className="p-6 rounded-2xl">
              <div className="flex items-center gap-4 mb-4">
                <Skeleton className="w-14 h-14 bg-white/10 rounded-2xl shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-40 bg-white/10" />
                  <Skeleton className="h-3 w-24 bg-white/5" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-7 w-20 bg-white/5 rounded-full" />
                <Skeleton className="h-7 w-24 bg-white/5 rounded-full" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
