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
            <Skeleton className="h-10 w-64 bg-white/5" />
            <Skeleton className="h-4 w-[350px] bg-white/5" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-11 w-36 bg-white/5 rounded-xl" />
            <Skeleton className="h-11 w-36 bg-white/5 rounded-xl" />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} glass className="p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-4 w-28 bg-white/5" />
                <Skeleton className="h-9 w-9 rounded-xl bg-white/10" />
              </div>
              <Skeleton className="h-8 w-36 bg-white/10" />
              <Skeleton className="h-3 w-24 bg-white/5 mt-2" />
            </Card>
          ))}
        </div>

        <Card glass className="overflow-hidden rounded-2xl">
          <div className="h-14 bg-white/5 border-b border-white/5 flex items-center px-6">
            <Skeleton className="h-4 w-full bg-white/10" />
          </div>
          <div className="divide-y divide-white/5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <Skeleton className="w-12 h-12 bg-white/10 rounded-xl shrink-0" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-56 bg-white/10" />
                    <Skeleton className="h-3 w-32 bg-white/5" />
                  </div>
                </div>
                <Skeleton className="h-7 w-24 bg-white/10 rounded-full" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminLayout>
  )
}
