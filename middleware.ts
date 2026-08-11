import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './src/lib/auth';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const publicRoutes = ['/', '/login', '/api/auth/login', '/api/auth/register'];
  const isPublicRoute = publicRoutes.includes(pathname);

  if (isPublicRoute && token) {
    // If logged in and trying to access login, redirect to dashboard
    return NextResponse.redirect(new URL('/announcements', request.url));
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
