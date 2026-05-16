import React from 'react'
import { Card } from '@/components/ui/card'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Skeleton } from '@/components/ui/skeleton'

export default function MoraLoading() {
  return (
    <AdminLayout>
      <div className="space-y-8 pb-20">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end justify-between mb-10">
          <div className="space-y-3">
            <Skeleton className="h-10 w-80 bg-white/5" />
            <Skeleton className="h-4 w-[500px] bg-white/5" />
          </div>
          <Skeleton className="h-11 w-44 bg-white/5 rounded-xl" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} glass className="p-6 overflow-hidden">
              <div className="flex items-center gap-4 mb-4">
                <Skeleton className="h-10 w-10 rounded-xl bg-white/10" />
                <Skeleton className="h-4 w-32 bg-white/10" />
              </div>
              <Skeleton className="h-10 w-48 bg-white/10" />
            </Card>
          ))}
        </div>

        {/* Table Skeleton */}
        <Card glass className="overflow-hidden rounded-2xl">
          <div className="h-14 bg-white/5 border-b border-white/5 flex items-center justify-between px-8">
            <Skeleton className="h-5 w-40 bg-white/10" />
            <Skeleton className="h-9 w-64 bg-white/5 rounded-full" />
          </div>
          <div className="divide-y divide-white/5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-6 flex items-center justify-between hover:bg-white/[0.01] transition-colors">
                <div className="flex items-center gap-5">
                  <Skeleton className="w-12 h-12 bg-white/10 rounded-xl shrink-0" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-64 bg-white/10" />
                    <Skeleton className="h-3 w-40 bg-white/5" />
                  </div>
                </div>
                <div className="hidden lg:flex gap-16 items-center">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-20 bg-white/5" />
                    <Skeleton className="h-5 w-24 bg-white/10" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-20 bg-white/5" />
                    <Skeleton className="h-5 w-24 bg-white/10" />
                  </div>
                </div>
                <Skeleton className="h-10 w-32 bg-white/5 rounded-xl" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminLayout>
  )
}
