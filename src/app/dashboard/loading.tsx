import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <AdminLayout>
      <div className="max-w-[1600px] mx-auto space-y-8 pb-10">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="space-y-3">
            <Skeleton className="h-10 w-72 bg-white/5" />
            <Skeleton className="h-4 w-56 bg-white/5" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-11 w-32 bg-white/5 rounded-xl" />
            <Skeleton className="h-11 w-32 bg-white/5 rounded-xl" />
            <Skeleton className="h-11 w-36 bg-white/5 rounded-xl" />
          </div>
        </div>

        {/* KPI Grid Skeleton */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} glass className="overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-6">
                <Skeleton className="h-4 w-28 bg-white/10" />
                <Skeleton className="h-9 w-9 rounded-xl bg-white/10" />
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-3">
                <Skeleton className="h-10 w-36 bg-white/10" />
                <Skeleton className="h-4 w-48 bg-white/5" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card glass className="lg:col-span-2 h-[450px] overflow-hidden">
             <CardHeader className="p-6 border-b border-white/5">
                <Skeleton className="h-6 w-40 bg-white/10 mb-2" />
                <Skeleton className="h-4 w-64 bg-white/5" />
             </CardHeader>
             <CardContent className="p-8 flex items-end gap-3 h-[340px]">
                {[...Array(12)].map((_, i) => (
                  <Skeleton 
                    key={i} 
                    className="flex-1 bg-white/10 rounded-t-lg transition-all duration-500" 
                    style={{ 
                      height: `${[60, 40, 75, 50, 90, 65, 45, 80, 55, 70, 40, 85][i]}%`,
                      opacity: 0.3 + (i * 0.05)
                    }}
                  />
                ))}
             </CardContent>
          </Card>
          
          <Card glass className="h-[450px] overflow-hidden">
             <CardHeader className="p-6 border-b border-white/5">
                <Skeleton className="h-6 w-40 bg-white/10" />
             </CardHeader>
             <CardContent className="flex flex-col items-center justify-center h-[360px] space-y-8">
                <div className="relative w-56 h-56">
                  <Skeleton className="absolute inset-0 rounded-full bg-white/5 border-[16px] border-white/5" />
                  <div className="absolute inset-4 rounded-full border-4 border-dashed border-white/10 animate-spin-slow" />
                </div>
                <div className="space-y-3 w-full max-w-[200px]">
                  <Skeleton className="h-4 w-full bg-white/10" />
                  <Skeleton className="h-4 w-4/5 bg-white/5 mx-auto" />
                </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
