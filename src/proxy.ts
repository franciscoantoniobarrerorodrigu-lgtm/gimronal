import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Rutas públicas o de recursos estáticos que no requieren protección
  if (
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/cron') ||
    pathname.startsWith('/api/ai') ||
    pathname.includes('.')
  ) {
    return supabaseResponse
  }

  // Endpoint de debug: solo accesible si hay usuario autenticado (se valida adicionalmente en la ruta)
  if (pathname.startsWith('/api/debug-cliente')) {
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    return supabaseResponse
  }

  // Rutas antiguas o directas de /portal
  if (pathname.startsWith('/portal')) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('tab', 'socio')
    return NextResponse.redirect(loginUrl)
  }

  // Rutas del portal de Socios
  if (pathname.startsWith('/socios')) {
    const clientSession = request.cookies.get('gym_client_session')?.value
    if (!clientSession) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/login'
      loginUrl.searchParams.set('tab', 'socio')
      return NextResponse.redirect(loginUrl)
    }
    return supabaseResponse
  }

  // Rutas Administrativas y de SaaS Master Center
  const adminRoutes = [
    '/dashboard',
    '/clientes',
    '/asistencia',
    '/caja',
    '/clases',
    '/configuracion',
    '/entrenadores',
    '/exoneraciones',
    '/inventario',
    '/mora',
    '/pagos',
    '/planes',
    '/reportes',
    '/saas',
  ]

  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))

  if (isAdminRoute && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('tab', pathname.startsWith('/saas') ? 'saas' : 'admin')
    return NextResponse.redirect(loginUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icon.png (favicon and app icon)
     * - images, icons, etc.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
