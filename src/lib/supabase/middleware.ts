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
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
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
    // Get user role from the user metadata (or you'd fetch from your users table)
    // For this example, assuming role is in user metadata or we can fetch it
    // Wait, the PRD says 'role: owner | sales | developer' is in the users table.
    // If it's a separate table, we'd query it. Let's fetch from the `users` table since supabase schema specifies it.
    // user.id is the UUID.
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role

    const isOwnerRoute = request.nextUrl.pathname.startsWith('/dashboard/owner')
    const isEmployeeRoute = request.nextUrl.pathname.startsWith('/dashboard/employee')

    if (isOwnerRoute && role !== 'owner') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard/employee' // Or fallback
      return NextResponse.redirect(url)
    }

    if (isEmployeeRoute && role === 'owner') {
      // Owners can probably access everything, or we direct them back
      // Let's redirect owners to owner dashboard if they hit employee dashboard
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard/owner'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
