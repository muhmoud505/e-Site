import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

/**
 * @param {import('next/server').NextRequest} request
 */
export async function middleware(request) {
  const sessionToken = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  // This variable should be named JWT_SECRET in your .env.local file
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    console.error('CRITICAL: JWT_SECRET is not defined. Middleware cannot verify tokens.');
    return NextResponse.redirect(new URL('/login?error=server_config', request.url));
  }

  if (!sessionToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const secret = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(sessionToken, secret);

    // If the user is trying to access an admin route but doesn't have the admin role, redirect them.
    if (pathname.startsWith('/admin') && payload.role !== 'admin') {
      // Redirect non-admins from admin routes to the homepage.
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  } catch (err) {
    // If token verification fails (expired, invalid), redirect to login.
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  // This matcher will now correctly run on the specified protected routes.
  matcher: [
    '/dashboard/:path*', '/dashboard', 
    '/profile/:path*', '/profile', 
    '/checkout/:path*',
    '/admin/:path*', '/admin' 
  ],
};