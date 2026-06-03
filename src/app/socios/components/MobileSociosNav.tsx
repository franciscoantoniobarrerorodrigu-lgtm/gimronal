'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays, CreditCard, Home, QrCode, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const ITEMS = [
  { href: '/socios', label: 'Inicio', icon: Home },
  { href: '/socios/horarios', label: 'Clases', icon: CalendarDays },
  { href: '/socios#qr', label: 'QR', icon: QrCode, featured: true, action: 'qr' },
  { href: '/socios/pagos', label: 'Pagos', icon: CreditCard },
  { href: '/socios/perfil', label: 'Perfil', icon: User },
]

import { showPremiumToast } from '@/lib/notifications'

export default function MobileSociosNav({ hasMembresia }: { hasMembresia?: boolean }) {
  const pathname = usePathname()

  return (
    <nav
      className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-50 rounded-[1.35rem] border border-white/10 bg-zinc-950/85 px-2 py-2 shadow-[0_18px_60px_rgba(0,0,0,0.55)] backdrop-blur-2xl md:hidden"
      aria-label="Navegacion del portal de socios"
    >
      <div className="grid grid-cols-5 items-end gap-1">
        {ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = item.href === '/socios' ? pathname === '/socios' : pathname.startsWith(item.href.replace('#qr', ''))
          const itemClassName = cn(
            'group flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[9px] font-black uppercase tracking-tight text-zinc-500 transition-all',
            isActive && !item.featured && 'bg-white/5 text-primary',
            item.featured && '-mt-8 text-primary'
          )
          const iconClassName = cn(
            'flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-all group-active:scale-95',
            isActive && !item.featured && 'border-primary/30 bg-primary/15',
            item.featured && 'size-14 rounded-2xl border-primary/40 bg-primary text-black shadow-lg shadow-primary/25'
          )

          if (item.action === 'qr') {
            return (
              <button
                key={item.href}
                type="button"
                className={itemClassName}
                onClick={(e) => {
                  if (hasMembresia === false) {
                    e.preventDefault()
                    showPremiumToast.error('Acceso denegado', 'No tienes membresía activa para registrar entrada.')
                    return
                  }
                  window.dispatchEvent(new Event('open-socios-qr'))
                }}
                aria-label="Abrir escaner QR"
              >
                <span className={iconClassName}>
                  <Icon className={cn('size-4', item.featured && 'size-7')} />
                </span>
                <span className="truncate">{item.label}</span>
              </button>
            )
          }

          return (
            <Link key={item.href} href={item.href} className={itemClassName}>
              <span className={iconClassName}>
                <Icon className={cn('size-4', item.featured && 'size-7')} />
              </span>
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
