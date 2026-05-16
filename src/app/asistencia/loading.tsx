import React from 'react'
import { Card } from '@/components/ui/card'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Skeleton } from '@/components/ui/skeleton'

export default function AsistenciaLoading() {
  return (
    <AdminLayout>
      <div className="max-w-[1400px] mx-auto space-y-8 pb-20">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center justify-between mb-10">
          <div className="space-y-3 text-center md:text-left">
            <Skeleton className="h-10 w-96 bg-white/5 mx-auto md:mx-0" />
            <Skeleton className="h-4 w-[450px] bg-white/5 mx-auto md:mx-0" />
          </div>
          <div className="flex gap-3">
             <Skeleton className="h-12 w-48 bg-white/5 rounded-xl" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Left: Scan Area Skeleton */}
           <div className="lg:col-span-1 space-y-6">
              <Card className="glass-card border-white/5 bg-white/[0.02] backdrop-blur-md p-8 flex flex-col items-center space-y-8 rounded-3xl">
                 <Skeleton className="h-8 w-48 bg-white/10" />
                 <div className="relative w-64 h-64 flex items-center justify-center">
                    <Skeleton className="absolute inset-0 rounded-3xl bg-white/5" />
                    <div className="w-48 h-48 border-4 border-dashed border-white/10 rounded-2xl animate-pulse" />
                 </div>
                 <div className="w-full space-y-4">
                    <Skeleton className="h-12 w-full bg-white/5 rounded-xl" />
                    <Skeleton className="h-4 w-3/4 bg-white/5 mx-auto" />
                 </div>
              </Card>

              {/* Status Indicator Skeleton */}
              <Card className="glass-card border-white/5 bg-white/[0.02] p-6 rounded-2xl flex items-center gap-4">
                 <Skeleton className="h-12 w-12 rounded-xl bg-white/10" />
                 <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32 bg-white/10" />
                    <Skeleton className="h-3 w-full bg-white/5" />
                 </div>
              </Card>
           </div>

           {/* Right: Recent Attendance Skeleton */}
           <div className="lg:col-span-2 space-y-6">
              <Card className="glass-card border-white/5 bg-white/[0.02] backdrop-blur-md overflow-hidden rounded-3xl">
                 <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <div className="space-y-2">
                       <Skeleton className="h-6 w-56 bg-white/10" />
                       <Skeleton className="h-4 w-40 bg-white/5" />
                    </div>
                    <Skeleton className="h-10 w-32 bg-white/5 rounded-xl" />
                 </div>
                 <div className="divide-y divide-white/5">
                    {[...Array(6)].map((_, i) => (
                       <div key={i} className="p-6 flex items-center justify-between hover:bg-white/[0.01] transition-colors">
                          <div className="flex items-center gap-5">
                             <Skeleton className="w-14 h-14 bg-white/10 rounded-2xl shrink-0" />
                             <div className="space-y-2">
                                <Skeleton className="h-5 w-64 bg-white/10" />
                                <div className="flex gap-3">
                                   <Skeleton className="h-4 w-24 bg-white/5" />
                                   <Skeleton className="h-4 w-32 bg-white/5" />
                                </div>
                             </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                             <Skeleton className="h-4 w-20 bg-white/10" />
                             <Skeleton className="h-7 w-28 bg-white/5 rounded-full" />
                          </div>
                       </div>
                    ))}
                 </div>
              </Card>
           </div>
        </div>
      </div>
    </AdminLayout>
  )
}
