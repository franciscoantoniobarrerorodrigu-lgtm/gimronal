import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function SociosLoading() {
  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 max-w-6xl mx-auto w-full z-10 space-y-6 md:space-y-8 min-h-screen">
      
      {/* Header Premium Skeleton */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/5 backdrop-blur-xl border border-white/10 p-4 sm:p-5 rounded-3xl">
        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/10" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-48 bg-white/10" />
            <Skeleton className="h-3 w-32 bg-white/5" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-10 h-10 rounded-full bg-white/10" />
          <Skeleton className="w-10 h-10 rounded-full bg-white/10" />
          <Skeleton className="w-10 h-10 rounded-full bg-white/10" />
        </div>
      </div>

      {/* Hero Section Skeleton */}
      <div className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-white/5 border border-white/5 p-6 md:p-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-6 flex-1 w-full max-w-md">
            <div className="space-y-3">
              <Skeleton className="h-12 w-3/4 bg-white/10" />
              <Skeleton className="h-5 w-full bg-white/5" />
            </div>
            
            <div className="space-y-4 pt-2">
              <div className="flex gap-3">
                <Skeleton className="h-8 w-32 rounded-full bg-white/10" />
                <Skeleton className="h-8 w-24 rounded-full bg-white/10" />
              </div>
              <Skeleton className="h-16 w-full rounded-2xl bg-white/5" />
            </div>
          </div>
          <div className="flex-shrink-0 flex items-center justify-center mt-6 md:mt-0">
            <Skeleton className="w-48 h-48 rounded-full bg-white/10" />
          </div>
        </div>
      </div>

      {/* Action Buttons Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-5 flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-xl bg-white/10 shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-3/4 bg-white/10" />
              <Skeleton className="h-3 w-1/2 bg-white/5" />
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Chart Skeleton */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-5 h-24 flex flex-col justify-between">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-24 bg-white/10" />
          <Skeleton className="h-3 w-16 bg-white/10" />
        </div>
        <div className="flex justify-between items-end gap-2">
          {[1,2,3,4,5,6,7].map(i => (
            <Skeleton key={i} className="w-full h-8 rounded-xl bg-white/10" />
          ))}
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-[2rem] p-5 md:p-6 h-40 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <Skeleton className="h-3 w-24 bg-white/10" />
              <Skeleton className="w-8 h-8 rounded-xl bg-white/10" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-8 w-20 bg-white/10" />
              <Skeleton className="h-10 w-full rounded-xl bg-white/5" />
            </div>
          </div>
        ))}
      </div>

      {/* Achievements Grid Skeleton */}
      <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 md:p-8">
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="w-12 h-12 rounded-2xl bg-white/10" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40 bg-white/10" />
            <Skeleton className="h-3 w-24 bg-white/5" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-5 flex flex-col items-center">
              <Skeleton className="w-14 h-14 rounded-2xl bg-white/10 mb-4" />
              <Skeleton className="h-4 w-20 bg-white/10 mb-2" />
              <Skeleton className="h-3 w-24 bg-white/5" />
            </div>
          ))}
        </div>
      </div>

      {/* History Skeleton */}
      <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 md:p-8">
        <Skeleton className="h-6 w-48 bg-white/10 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5">
              <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-xl bg-white/10" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32 bg-white/10" />
                  <Skeleton className="h-3 w-24 bg-white/5" />
                </div>
              </div>
              <Skeleton className="h-6 w-20 rounded-full bg-white/10" />
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
