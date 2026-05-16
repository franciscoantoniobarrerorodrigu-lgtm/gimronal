'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Calendar, 
  Dumbbell, 
  Activity, 
  Settings, 
  Package, 
  ChevronRight,
  LogOut,
  QrCode,
  AlertCircle,
  Users2,
  MessageSquare,
  BarChart3,
  Wallet,
  ShieldCheck,
  X,
  Globe,
  ArrowLeftRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { clearGymContext } from '@/lib/supabase/actions/saas'
import { toast } from 'sonner'

const menuItems = [
  { name: 'Dashboard', icon: Dumbbell, href: '/dashboard' },
  { name: 'Clientes', icon: Users, href: '/clientes' },
  { name: 'Membresías', icon: CreditCard, href: '/planes' },
  { name: 'Caja', icon: Wallet, href: '/caja' },
  { name: 'Pagos', icon: CreditCard, href: '/pagos' },
  { name: 'Mora', icon: AlertCircle, href: '/mora' },
  { name: 'Asistencia', icon: QrCode, href: '/asistencia' },
  { name: 'Entrenadores', icon: Dumbbell, href: '/entrenadores' },
  { name: 'Inventario', icon: Package, href: '/inventario' },
  { name: 'WhatsApp', icon: MessageSquare, href: '/configuracion/whatsapp' },
  { name: 'Exoneración', icon: ShieldCheck, href: '/exoneraciones' },
  { name: 'Reportes', icon: BarChart3, href: '/reportes' },
  { name: 'Configuración', icon: Settings, href: '/configuracion' },
]

interface SidebarProps {
  closeMobile?: () => void
  gymName?: string
}

export function Sidebar({ closeMobile, gymName: initialGymName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isSaaSAdmin, setIsSaaSAdmin] = React.useState(false)
  const [gymName, setGymName] = React.useState(initialGymName || 'GymControl')
  const [isPending, setIsPending] = React.useState(false)

  React.useEffect(() => {
    if (initialGymName) setGymName(initialGymName)
  }, [initialGymName])

  React.useEffect(() => {
    async function checkSaaS() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('perfiles')
          .select('is_saas_admin')
          .eq('id', user.id)
          .single()
        setIsSaaSAdmin(!!data?.is_saas_admin)
      }
    }
    checkSaaS()
  }, [])

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  return (
    <div className="flex flex-col h-full w-full bg-card/40 backdrop-blur-xl border-r border-border transition-all duration-300 z-30 shadow-lg lg:w-64">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative group/logo">
            <div className="absolute -inset-1.5 bg-primary/20 blur-md rounded-xl opacity-0 group-hover/logo:opacity-100 transition-opacity" />
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 relative z-10 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              <Dumbbell className="text-primary-foreground w-6 h-6 animate-in zoom-in duration-500" />
            </div>
          </div>
          <div className="flex flex-col">
            <span 
              className="font-black text-lg tracking-tighter text-foreground truncate max-w-[170px] leading-none uppercase italic"
              title={gymName}
            >
              {gymName}
            </span>
            <span className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase opacity-70">
              Power System
            </span>
          </div>
        </div>
        
        {closeMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden text-muted-foreground hover:text-foreground"
            onClick={closeMobile}
            aria-label="Cerrar menú de navegación"
          >
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      <nav className="flex-1 px-4 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={closeMobile}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 group",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <div className="flex items-center">
                <item.icon className={cn(
                   "w-5 h-5 mr-3 transition-colors duration-300",
                   isActive ? "text-primary-foreground" : "group-hover:text-primary"
                )} />
                {item.name}
              </div>
              {isActive && <ChevronRight className="w-4 h-4 opacity-70" />}
            </Link>
          )
        })}

        {isSaaSAdmin && (
          <div className="mt-4 pt-4 border-t border-border/50 px-2">
            <Button
              variant="ghost"
              disabled={isPending}
              onClick={async () => {
                setIsPending(true)
                try {
                  await clearGymContext()
                } catch (error) {
                  setIsPending(false)
                }
              }}
              className="w-full justify-start text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 font-bold"
            >
              {isPending ? (
                <div className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <ArrowLeftRight className="w-5 h-5 mr-3" />
              )}
              {isPending ? 'Saliendo...' : 'Volver a Panel Global'}
            </Button>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-border">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
          aria-label="Cerrar sesión"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )
}

