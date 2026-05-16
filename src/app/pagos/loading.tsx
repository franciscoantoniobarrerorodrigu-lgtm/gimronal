import React from 'react'
import { Card } from '@/components/ui/card'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <AdminLayout>
      <div className="space-y-6 md:space-y-10 pb-20">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end justify-between mb-8">
          <div className="space-y-3">
            <Skeleton className="h-10 w-80 bg-white/5" />
            <Skeleton className="h-4 w-[450px] bg-white/5" />
          </div>
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-11 w-40 bg-white/5 rounded-xl" />
            <Skeleton className="h-11 w-48 bg-white/5 rounded-xl" />
          </div>
        </div>

        {/* Stats Summary Skeleton (Optional if page has it) */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i} glass className="p-6 rounded-2xl">
              <Skeleton className="h-4 w-24 bg-white/5 mb-3" />
              <Skeleton className="h-8 w-40 bg-white/10" />
            </Card>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between p-1">
          <div className="flex gap-3">
            <Skeleton className="h-9 w-32 bg-white/5 rounded-full" />
            <Skeleton className="h-9 w-32 bg-white/5 rounded-full" />
          </div>
          <Skeleton className="h-11 w-full md:w-[400px] bg-white/5 rounded-full" />
        </div>

        {/* Table Skeleton */}
        <Card glass className="overflow-hidden rounded-2xl">
          <div className="h-14 bg-white/5 border-b border-white/5 flex items-center px-8">
            <Skeleton className="h-4 w-full bg-white/10" />
          </div>
          <div className="divide-y divide-white/5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="p-5 flex items-center justify-between hover:bg-white/[0.01] transition-colors">
                <div className="flex items-center gap-5">
                  <Skeleton className="w-12 h-12 bg-white/10 rounded-xl shrink-0" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-64 bg-white/10" />
                    <Skeleton className="h-3 w-44 bg-white/5" />
                  </div>
                </div>
                <div className="hidden lg:flex gap-16 items-center">
                  <Skeleton className="h-6 w-28 bg-white/10 rounded-full" />
                  <Skeleton className="h-4 w-32 bg-white/5" />
                  <Skeleton className="h-4 w-24 bg-white/5" />
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-24 bg-white/5 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminLayout>
  )
}
