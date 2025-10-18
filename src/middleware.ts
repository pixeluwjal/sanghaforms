// middleware.ts - Minimal version
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const pathname = request.nextUrl.pathname;
  
  console.log('🛡️ Middleware triggered for:', pathname);

  // Only protect these specific routes
  const protectedRoutes = [
    '/admin',
    '/admin/forms',
    '/admin/users', 
    '/admin/settings'
  ];

  // Check exact matches (not sub-routes)
  if (protectedRoutes.includes(pathname)) {
    if (!token) {
      console.log('❌ No token, redirecting to login');
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      await verifyToken(token);
      console.log('✅ Token valid');
      return NextResponse.next();
    } catch (error) {
      console.log('❌ Token invalid:', error);
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.set('token', '', { maxAge: 0 });
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/forms', '/admin/users', '/admin/settings'],
};