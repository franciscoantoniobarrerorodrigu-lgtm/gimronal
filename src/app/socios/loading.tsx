import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function SociosLoading() {
  return (
    <div className="min-h-screen bg-[#030303] text-white p-4 md:p-8 space-y-8 pb-24">
      {/* Top Header / Profile Card Skeleton */}
      <Card className="glass-card border-white/5 bg-white/[0.02] backdrop-blur-xl rounded-3xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
        <CardContent className="p-6 md:p-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
              <Skeleton className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-white/10 ring-4 ring-white/5" />
              <Skeleton className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-white/10" />
            </div>
            <div className="flex-1 space-y-4 text-center md:text-left w-full">
              <div className="space-y-2">
                <Skeleton className="h-10 w-full max-w-[400px] bg-white/10 mx-auto md:mx-0" />
                <Skeleton className="h-4 w-full max-w-[250px] bg-white/5 mx-auto md:mx-0" />
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
                <Skeleton className="h-8 w-24 bg-white/10 rounded-full" />
                <Skeleton className="h-8 w-32 bg-white/5 rounded-full" />
              </div>
            </div>
            <Skeleton className="hidden lg:block w-32 h-32 bg-white/5 rounded-3xl" />
          </div>
        </CardContent>
      </Card>

      {/* Main Grid: Membership & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Membership Details */}
        <Card className="lg:col-span-2 glass-card border-white/5 bg-white/[0.02] backdrop-blur-xl rounded-3xl p-8 space-y-8">
          <div className="flex justify-between items-center">
            <Skeleton className="h-7 w-48 bg-white/10" />
            <Skeleton className="h-10 w-10 rounded-full bg-white/5" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4 p-6 rounded-2xl bg-white/[0.01] border border-white/5">
              <Skeleton className="h-4 w-24 bg-white/5" />
              <Skeleton className="h-8 w-40 bg-white/10" />
            </div>
            <div className="space-y-4 p-6 rounded-2xl bg-white/[0.01] border border-white/5">
              <Skeleton className="h-4 w-24 bg-white/5" />
              <Skeleton className="h-8 w-40 bg-white/10" />
            </div>
          </div>
          <div className="space-y-4">
             <div className="flex justify-between px-2">
                <Skeleton className="h-4 w-32 bg-white/5" />
                <Skeleton className="h-4 w-12 bg-white/10" />
             </div>
             <Skeleton className="h-4 w-full bg-white/5 rounded-full" />
          </div>
        </Card>

        {/* Quick Access / QR Placeholder */}
        <Card className="glass-card border-white/5 bg-white/[0.02] backdrop-blur-xl rounded-3xl p-8 flex flex-col items-center justify-center space-y-6">
          <Skeleton className="h-6 w-32 bg-white/10" />
          <div className="p-4 bg-white/5 rounded-3xl">
            <Skeleton className="w-48 h-48 bg-white/10 rounded-2xl" />
          </div>
          <Skeleton className="h-10 w-full bg-white/5 rounded-xl" />
        </Card>
      </div>

      {/* Activity History Skeleton */}
      <Card className="glass-card border-white/5 bg-white/[0.02] backdrop-blur-xl rounded-3xl p-8">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-7 w-56 bg-white/10" />
          <Skeleton className="h-10 w-32 bg-white/5 rounded-xl" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.01] border border-white/5">
              <div className="flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-xl bg-white/10" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32 bg-white/10" />
                  <Skeleton className="h-3 w-24 bg-white/5" />
                </div>
              </div>
              <Skeleton className="h-6 w-20 bg-white/5 rounded-full" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
