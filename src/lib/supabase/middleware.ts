import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
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

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT use supabase.auth.getSession() here!
  // It resolves from the cookie, which may be spoofed.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Define route protection logic
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard')
  
  if (isDashboardRoute && !user) {
    // Redirect unauthenticated users to login
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (isDashboardRoute && user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role, status')
      .eq('id', user.id)
      .single()

    const role = profile?.role

    // Role-based Protection
    const isOwnerRoute = request.nextUrl.pathname.startsWith('/dashboard/owner')

    if (isOwnerRoute && role !== 'owner') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard/employee'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
