import React from 'react'
import { Card } from '@/components/ui/card'
import { AdminLayout } from '@/components/layout/AdminLayout'

export default function Loading() {
  return (
    <AdminLayout>
      <div className="space-y-6 md:space-y-10 animate-pulse pb-20">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end justify-between">
          <div className="space-y-2">
            <div className="h-10 w-64 bg-zinc-800 rounded-lg" />
            <div className="h-4 w-96 bg-zinc-800/50 rounded-md" />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="h-10 w-32 bg-zinc-800 rounded-lg" />
            <div className="h-10 w-40 bg-zinc-800 rounded-lg" />
          </div>
        </div>

        {/* Search & Filter Bar Skeleton */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2">
            {[1, 2, 3].map(i => <div key={i} className="h-8 w-24 bg-zinc-800 rounded-full" />)}
          </div>
          <div className="h-10 w-full md:w-80 bg-zinc-800 rounded-full" />
        </div>

        {/* Table Skeleton */}
        <Card className="glass-card border-white/5 overflow-hidden">
          <div className="h-12 bg-zinc-800/50 border-b border-white/5" />
          <div className="divide-y divide-white/5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-zinc-800 rounded-lg shrink-0" />
                  <div className="space-y-2">
                    <div className="h-4 w-48 bg-zinc-800 rounded" />
                    <div className="h-3 w-32 bg-zinc-800/50 rounded" />
                  </div>
                </div>
                <div className="hidden md:flex gap-8">
                  <div className="h-6 w-20 bg-zinc-800 rounded-full" />
                  <div className="h-4 w-24 bg-zinc-800 rounded" />
                  <div className="h-4 w-16 bg-zinc-800 rounded" />
                </div>
                <div className="h-8 w-8 bg-zinc-800 rounded-md" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminLayout>
  )
}
