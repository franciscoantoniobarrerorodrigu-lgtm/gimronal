'use client'

import { useState, useEffect } from 'react'
import { RotateCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function ClientRefreshIndicator() {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()

  const handleRefresh = () => {
    setIsRefreshing(true)
    router.refresh()
    setTimeout(() => {
      setLastUpdated(new Date())
      setIsRefreshing(false)
    }, 1000)
  }

  return (
    <div className="flex flex-col items-end mr-2 hidden md:flex">
      <button 
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-primary transition-colors group"
      >
        <RotateCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-primary' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
        <span>{isRefreshing ? 'Actualizando...' : 'Actualizar'}</span>
      </button>
      <span className="text-[8px] text-zinc-600 font-bold">
        Sincronizado: {format(lastUpdated, 'HH:mm', { locale: es })}
      </span>
    </div>
  )
}
