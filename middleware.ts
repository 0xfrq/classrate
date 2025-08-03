import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const { pathname } = request.nextUrl

  // Allow access to authentication endpoints and static files
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/static')
  ) {
    return NextResponse.next()
  }

  // Check for auth cookie
  const authCookie = request.cookies.get('auth-user')
  
  // If no auth cookie and trying to access protected routes, redirect to auth
  if (!authCookie && !pathname.startsWith('/auth')) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    const response = NextResponse.redirect(url)
    // Set a flag to show auth dialog
    response.cookies.set('show-auth', 'true', { maxAge: 60 })
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}
