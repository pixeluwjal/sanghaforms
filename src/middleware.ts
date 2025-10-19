// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const pathname = request.nextUrl.pathname;
  
  console.log('🛡️ Middleware triggered for:', pathname);

  // Auth pages that logged-in users should NOT access
  const authPages = [
    '/login',
    '/admin/register', 
    '/setup-account'
  ];

  // Protected admin pages that require authentication
  const protectedAdminPages = [
    '/admin',
    '/admin/forms',
    '/admin/users',
    '/admin/settings',
    '/admin/responses',
    '/admin/dashboard'
  ];

  // Public form pages that anyone can access
  const publicFormPages = [
    '/forms',
    '/forms/[slug]' // This will match /forms/anything
  ];

  // Check if user is trying to access auth pages while logged in
  if (authPages.includes(pathname)) {
    if (token) {
      try {
        await verifyToken(token);
        console.log('✅ User logged in, redirecting from auth page to admin');
        return NextResponse.redirect(new URL('/admin', request.url));
      } catch (error) {
        // Token invalid, allow access to auth page
        console.log('❌ Token invalid, allowing auth page access');
        return NextResponse.next();
      }
    }
    // No token, allow access to auth pages
    return NextResponse.next();
  }

  // Check if user is trying to access protected admin pages
  if (protectedAdminPages.includes(pathname) || pathname.startsWith('/admin/')) {
    if (!token) {
      console.log('❌ No token, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      await verifyToken(token);
      console.log('✅ Token valid, allowing admin access');
      return NextResponse.next();
    } catch (error) {
      console.log('❌ Token invalid, redirecting to login');
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.set('token', '', { maxAge: 0 });
      return response;
    }
  }

  // Check if user is trying to access public form pages
  if (pathname.startsWith('/forms/')) {
    // Always allow access to form pages, no authentication required
    console.log('📝 Allowing public form access');
    return NextResponse.next();
  }

  // Allow all other routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};