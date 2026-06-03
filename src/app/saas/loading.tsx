import React from 'react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <Skeleton className="h-10 w-64 bg-white/5" />
            <Skeleton className="h-4 w-80 bg-white/5" />
          </div>
          <Skeleton className="h-11 w-40 bg-white/5 rounded-xl" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} glass className="p-6 rounded-2xl">
              <div className="flex items-center gap-4 mb-4">
                <Skeleton className="w-14 h-14 bg-white/10 rounded-2xl shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-40 bg-white/10" />
                  <Skeleton className="h-3 w-24 bg-white/5" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full bg-white/5" />
                <Skeleton className="h-4 w-3/4 bg-white/5" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
