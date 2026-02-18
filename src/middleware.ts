import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { locales, localePrefix } from './lib/navigation'

const intlMiddleware = createIntlMiddleware({
  locales,
  localePrefix,
  defaultLocale: 'es'
})

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle i18n first
  const response = intlMiddleware(request)

  // Skip auth check for static assets and API routes
  if (
    pathname.includes('.') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next')
  ) {
    return response
  }

  const isAuthPage = pathname.includes('/login') || pathname.includes('/signup')
  const isProtectedPage = pathname.includes('/dashboard') ||
    pathname.includes('/leads') ||
    pathname.includes('/calls') ||
    pathname.includes('/sms') ||
    pathname.includes('/appointments') ||
    pathname.includes('/settings') ||
    pathname.includes('/admin') ||
    pathname.includes('/analytics')

  if (!isAuthPage && !isProtectedPage) {
    return response
  }

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
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // Protected pages need auth
    if (!user && isProtectedPage) {
      const url = request.nextUrl.clone()
      // We need to keep the locale prefix if it exists
      const locale = pathname.split('/')[1]
      url.pathname = `/${locale}/login`
      return NextResponse.redirect(url)
    }

    // Auth pages should redirect to dashboard if logged in
    if (user && isAuthPage) {
      const url = request.nextUrl.clone()
      const locale = pathname.split('/')[1]
      url.pathname = `/${locale}/dashboard`
      return NextResponse.redirect(url)
    }

    return response
  } catch (error) {
    console.error('Middleware auth error:', error)
    return response
  }
}

export const config = {
  matcher: [
    // Match all routes for i18n, then filtered inside middleware
    '/((?!api|_next|.*\\..*).*)',
  ],
}
