import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase-middleware'
import { createServerClient } from '@supabase/ssr'

const COOKIE_NAME = 'gym_client_session'

export async function proxy(request: NextRequest) {
  // First update/refresh the session
  const response = await updateSession(request)
  
  // Create a supabase client to check the current user
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
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  
  // Check for socio session cookie
  const clientSession = request.cookies.get(COOKIE_NAME)?.value

  const pathname = request.nextUrl.pathname

  // Public paths that don't need any auth
  const isLoginPage = pathname === '/login'
  const isSocioLoginPage = pathname === '/socios/login'
  const isRootPage = pathname === '/'
  const isPublicAsset = pathname.startsWith('/_next') || pathname.includes('.')
  const isPublicPage = isLoginPage || isSocioLoginPage || isRootPage || isPublicAsset

  // Socio routes start with /socios
  const isSocioRoute = pathname.startsWith('/socios')

  // If visiting a socio route
  if (isSocioRoute && !isSocioLoginPage) {
    // Socio routes need the client cookie, not Supabase Auth
    if (!clientSession) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    // Has client cookie — allow access
    return response
  }

  // If visiting an admin route (everything else that's not public)
  if (!isPublicPage) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    // Has admin session — allow access
    return response
  }

  // If admin is on login page, redirect to dashboard
  if (user && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If socio is on login page, redirect to socios portal
  if (clientSession && isLoginPage) {
    return NextResponse.redirect(new URL('/socios', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
