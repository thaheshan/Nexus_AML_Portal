import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // 1. Enforce HTTPS in Production Environment
  if (
    process.env.NODE_ENV === 'production' &&
    request.headers.get('x-forwarded-proto') === 'http'
  ) {
    const httpsUrl = `https://${request.headers.get('host')}${pathname}${request.nextUrl.search}`;
    return NextResponse.redirect(httpsUrl, 301);
  }

  // 2. CSRF Token Verification on Mutation Requests (POST, PUT, PATCH, DELETE)
  const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method);
  const isApiRoute = pathname.startsWith('/api/');
  const isAuthLoginOrRegister = ['/api/auth/login', '/api/auth/register'].includes(pathname);

  if (isMutation && isApiRoute && !isAuthLoginOrRegister) {
    const csrfHeader = request.headers.get('x-csrf-token');
    const csrfCookie = request.cookies.get('csrf-token')?.value;

    if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
      return NextResponse.json(
        { error: 'Invalid or missing CSRF token' },
        { status: 403 }
      );
    }
  }

  // 3. Route Access Authorization
  const publicRoutes = [
    '/', '/login', '/register', '/register/role', 
    '/forgot-password', '/reset-password', 
    '/api/auth/login', '/api/auth/register', '/api/auth/logout', 
    '/api/auth/forgot-password', '/api/auth/reset-password'
  ];
  const isPublicRoute = publicRoutes.some(r => pathname === r || pathname.startsWith(r + '?'));

  if (isPublicRoute && token && !pathname.startsWith('/api')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (!isPublicRoute && !token && !pathname.startsWith('/_next') && !pathname.startsWith('/favicon.ico')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const response = NextResponse.next();

  // Attach/ensure CSRF Cookie for client use if not set (using Web Crypto API for Edge compatibility)
  if (!request.cookies.has('csrf-token')) {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const newCsrfToken = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');

    response.cookies.set('csrf-token', newCsrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
