import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './src/lib/auth';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const publicRoutes = ['/', '/login', '/register', '/register/role', '/forgot-password', '/reset-password', '/api/auth/login', '/api/auth/register', '/api/auth/logout', '/api/auth/forgot-password', '/api/auth/reset-password'];
  const isPublicRoute = publicRoutes.some(r => pathname === r || pathname.startsWith(r + '?'));

  if (isPublicRoute && token && !pathname.startsWith('/api')) {
    // If logged in and trying to access a public page, redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (!isPublicRoute && !token && !pathname.startsWith('/_next') && !pathname.startsWith('/favicon.ico')) {
    // If not logged in and trying to access protected route, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // TODO: Add proper JWT verification inside Edge Runtime if possible, 
  // Jose supports edge runtime, but for simplicity we rely on token existence here 
  // and do hard verification in API routes/Server components.

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
