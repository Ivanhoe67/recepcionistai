import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Skip middleware for static assets and API routes
  const { pathname } = request.nextUrl

  // Only run auth check on protected pages
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup')
  const isProtectedPage = pathname.startsWith('/dashboard') ||
                          pathname.startsWith('/leads') ||
                          pathname.startsWith('/calls') ||
                          pathname.startsWith('/sms') ||
                          pathname.startsWith('/appointments') ||
                          pathname.startsWith('/settings') ||
                          pathname.startsWith('/admin') ||
                          pathname.startsWith('/analytics')

  // Skip auth check for non-protected pages
  if (!isAuthPage && !isProtectedPage) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // Redirect to login if trying to access protected page without auth
    if (!user && isProtectedPage) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // Redirect to dashboard if trying to access auth page while logged in
    if (user && isAuthPage) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    return supabaseResponse
  } catch (error) {
    // If Supabase fails, allow the request to continue
    // The page will handle auth state
    console.error('Middleware auth error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    // Only match protected routes - skip landing, api, static files
    '/(dashboard|leads|calls|sms|appointments|settings|admin|analytics|login|signup)(.*)',
  ],
}
