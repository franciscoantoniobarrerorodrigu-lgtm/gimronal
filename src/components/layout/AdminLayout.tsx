'use client'

import React, { useState, useMemo } from 'react'
import { Sidebar } from './Sidebar'
import { NotificationCenter } from './NotificationCenter'
import { Menu, ChevronRight, AlertTriangle } from 'lucide-react'
import { Breadcrumbs } from './Breadcrumbs'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { InactiveGymGuard } from './InactiveGymGuard'
import { UserNav } from './UserNav'
import { getGimnasio } from '@/lib/supabase/actions/gimnasio'
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

interface AdminLayoutProps {
  children: React.ReactNode
  isGymActive?: boolean
  isLicenseExpired?: boolean
  vencimientoLicencia?: string | null
  gymName?: string
}

export function AdminLayout({ 
  children, 
  isGymActive = true, 
  isLicenseExpired: isLicenseExpiredProp,
  vencimientoLicencia,
  gymName = "Gimnasio" 
}: AdminLayoutProps) {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [internalGymData, setInternalGymData] = useState<any>(null)

  // Recuperar datos si no se pasan por props
  useEffect(() => {
    if (vencimientoLicencia === undefined || isGymActive === undefined) {
      getGimnasio().then(setInternalGymData)
    }
  }, [vencimientoLicencia, isGymActive])

  // Determinar si la licencia ha expirado
  const isLicenseExpired = useMemo(() => {
    if (isLicenseExpiredProp !== undefined) return isLicenseExpiredProp
    const vencimiento = vencimientoLicencia || internalGymData?.vencimiento_licencia
    const todayStr = new Date().toISOString().split('T')[0]
    const vencimientoStr = vencimiento ? new Date(vencimiento).toISOString().split('T')[0] : null
    return vencimientoStr ? vencimientoStr <= todayStr : false
  }, [isLicenseExpiredProp, vencimientoLicencia, internalGymData])

  // Calcular los días restantes para mostrar banner
  const daysUntilExpiration = useMemo(() => {
    const vencimiento = vencimientoLicencia || internalGymData?.vencimiento_licencia
    if (!vencimiento) return null
    const vencDate = new Date(vencimiento)
    const today = new Date()
    const diffMs = vencDate.getTime() - today.getTime()
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  }, [vencimientoLicencia, internalGymData])

  // El gimnasio se considera inactivo si se marcó manualmente como inactivo O si la licencia expiró
  const shouldBlockAccess = useMemo(() => {
    const activeStatus = isGymActive !== undefined ? isGymActive : (internalGymData?.activo !== false)
    return !activeStatus || isLicenseExpired
  }, [isGymActive, internalGymData, isLicenseExpired])

  const finalGymName = gymName !== "Gimnasio" ? gymName : (internalGymData?.nombre || gymName)

  return (
    <div className="flex min-h-screen bg-background relative overflow-hidden selection:bg-primary/30 text-foreground transition-colors duration-300">
      {/* Ambient premium glows - subtler in light mode */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
      
      <div className="relative z-10 flex w-full h-screen overflow-hidden">
        {shouldBlockAccess && (
            <InactiveGymGuard 
              gymName={finalGymName} 
              type={isLicenseExpired ? 'expired' : 'inactive'} 
            />
        )}
        
        {/* Sidebar Desktop */}
        <nav className="hidden lg:block" role="navigation" aria-label="Menú principal">
          <Sidebar gymName={finalGymName} />
        </nav>

        {/* Sidebar Mobile Overlay */}
        <div className={cn(
          "fixed inset-0 z-50 lg:hidden transition-opacity duration-300",
          isSidebarOpen ? "bg-black/60 opacity-100 backdrop-blur-sm" : "bg-transparent opacity-0 pointer-events-none"
        )} onClick={() => setIsSidebarOpen(false)}>
          <div className={cn(
            "fixed inset-y-0 left-0 w-72 bg-background border-r border-border transition-transform duration-300 transform",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )} onClick={(e) => e.stopPropagation()}>
            <Sidebar gymName={finalGymName} closeMobile={() => setIsSidebarOpen(false)} />
          </div>
        </div>
        
        <div className="flex-1 flex flex-col min-w-0 h-full">
          {/* Top Header */}
          <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-border bg-background/80 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden text-muted-foreground hover:text-foreground"
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Abrir menú de navegación"
              >
                <Menu className="w-6 h-6" />
              </Button>
              <Breadcrumbs />
            </div>
            
            <div className="flex items-center gap-4">
              <NotificationCenter />
              <UserNav />
            </div>
          </header>

          {daysUntilExpiration !== null && daysUntilExpiration <= 5 && daysUntilExpiration > 0 && !shouldBlockAccess && (
            <div className="bg-rose-500/10 border-b border-rose-500/20 px-4 py-2 flex items-center justify-center gap-2 backdrop-blur-md">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <p className="text-sm text-rose-600 dark:text-rose-400 font-medium text-center">
                ¡Atención! La licencia de tu gimnasio vence en {daysUntilExpiration} {daysUntilExpiration === 1 ? 'día' : 'días'}. 
                <a href="/configuracion" className="ml-2 font-bold underline decoration-rose-500/30 hover:decoration-rose-500">
                  Renovar ahora
                </a>
              </p>
            </div>
          )}

          <main className="flex-1 p-3 md:p-8 overflow-y-auto relative z-20 custom-scrollbar">
            <div className="max-w-7xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
