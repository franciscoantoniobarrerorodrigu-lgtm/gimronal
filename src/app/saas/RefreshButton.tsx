'use client'
import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export function RefreshButton() {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    router.refresh()
    // Give it a little time for the animation to be visible
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="bg-white/[0.03] border-white/10 hover:bg-white/[0.08] text-zinc-400 hover:text-white rounded-xl h-10 px-4 transition-all active:scale-95 group"
    >
      <RefreshCw className={cn(
        "w-4 h-4 mr-2 transition-all duration-700",
        isRefreshing ? "animate-spin text-blue-500" : "group-hover:rotate-180"
      )} />
      <span className="text-[11px] font-black uppercase tracking-wider">
        {isRefreshing ? 'Actualizando...' : 'Actualizar Lista'}
      </span>
    </Button>
  )
}
