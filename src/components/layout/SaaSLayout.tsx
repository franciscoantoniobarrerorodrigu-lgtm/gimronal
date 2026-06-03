'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Settings, 
  LogOut,
  Dumbbell,
  Menu,
  X,
  ChevronRight,
  Globe,
  ArrowLeftRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { UserNav } from './UserNav'

const saasMenuItems = [
  { name: 'Dashboard Global', icon: LayoutDashboard, href: '/saas' },
  { name: 'Gimnasios (Simulaciones)', icon: Building2, href: '/saas' },
  { name: 'Usuarios Globales', icon: Users, href: '/saas' }, 
  { name: 'Configuración SaaS', icon: Settings, href: '/saas' },
]

export function SaaSLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="fixed inset-0 flex bg-[#050505] text-foreground transition-colors duration-300 overflow-hidden selection:bg-blue-500/30">
      <style jsx global>{`
        body, html {
          overflow: hidden !important;
          height: 100% !important;
        }
      `}</style>
      
      {/* Ambient premium glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none -z-0" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none -z-0" />
      
      <div className="relative z-10 flex w-full h-full overflow-hidden">
        {/* Sidebar */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-card/40 backdrop-blur-xl border-r border-border transition-transform duration-300 transform lg:translate-x-0 lg:static lg:inset-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex flex-col h-full">
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Globe className="text-white w-5 h-5" />
                </div>
                <span className="font-bold text-xl tracking-tight">GymSaaS Admin</span>
              </div>
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <nav className="flex-1 px-4 flex flex-col gap-1 overflow-y-auto">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 px-3">Gestión Central</div>
              {saasMenuItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 group",
                      isActive 
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" 
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <div className="flex items-center">
                      <item.icon className={cn(
                        "w-5 h-5 mr-3 transition-colors duration-300",
                        isActive ? "text-white" : "group-hover:text-blue-500"
                      )} />
                      {item.name}
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 opacity-70" />}
                  </Link>
                )
              })}

              <div className="mt-4 pt-4 border-t border-border/50">
                <Link
                  href="/dashboard"
                  className="flex items-center px-3 py-2.5 rounded-lg text-sm font-bold text-orange-400 hover:bg-orange-500/10 transition-all duration-300"
                >
                  <ArrowLeftRight className="w-5 h-5 mr-3" />
                  Ir a Dashboard Gimnasio
                </Link>
              </div>
            </nav>

            <div className="p-4 border-t border-border mt-auto">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5 mr-3" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
        )}

        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-background/50 backdrop-blur-md shrink-0">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </Button>
            <div className="flex items-center gap-4 ml-auto">
              <div className="flex flex-col items-end mr-2">
                <span className="text-xs font-semibold">Superadmin</span>
                <span className="text-[10px] text-muted-foreground">Panel de Control Global</span>
              </div>
              <UserNav />
            </div>
          </header>

          <main className="flex-1 p-3 sm:p-6 lg:p-10 overflow-y-auto overflow-x-hidden">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
