'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

const routeNames: Record<string, string> = {
  dashboard: 'Dashboard',
  clientes: 'Clientes',
  planes: 'Membresías',
  caja: 'Caja',
  pagos: 'Pagos',
  mora: 'Mora',
  asistencia: 'Asistencia',
  clases: 'Clases Grupales',
  entrenadores: 'Entrenadores',
  inventario: 'Inventario',
  exoneraciones: 'Exoneración',
  reportes: 'Reportes',
  configuracion: 'Configuración',
  apariencia: 'Apariencia',
  gimnasio: 'Gimnasio',
  seguridad: 'Seguridad',
  notificaciones: 'Notificaciones',
  whatsapp: 'WhatsApp',
  saas: 'Panel SaaS',
  socios: 'Portal Socios',
}

export function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  // Don't show breadcrumbs on root or single-level paths
  if (segments.length <= 1) return null

  const crumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/')
    const name = routeNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
    const isLast = index === segments.length - 1

    return { href, name, isLast }
  })

  return (
    <nav aria-label="Breadcrumb" className="hidden md:flex items-center gap-1 text-[12px]">
      {crumbs.map((crumb, index) => (
        <React.Fragment key={crumb.href}>
          {index > 0 && (
            <ChevronRight className="w-3 h-3 text-muted-foreground/50 shrink-0" aria-hidden="true" />
          )}
          {crumb.isLast ? (
            <span
              className="font-bold text-foreground truncate max-w-[180px]"
              aria-current="page"
            >
              {crumb.name}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="text-muted-foreground hover:text-foreground transition-colors truncate max-w-[140px] font-medium"
            >
              {crumb.name}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}
