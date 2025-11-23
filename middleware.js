import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

/**
 * @param {import('next/server').NextRequest} request
 */
export async function middleware(request) {
  const sessionToken = request.cookies.get('session_token')?.value;
  console.log('Session Token:', sessionToken);
  const { pathname } = request.nextUrl;
  console.log(pathname +'here pah');
  

  // It's crucial that this variable is named NEXT_PUBLIC_JWT_SECRET in your .env.local file
  const jwtSecret = process.env.NEXT_PUBLIC_JWT_SECRET;

  if (!jwtSecret) {
    console.error('CRITICAL: NEXT_PUBLIC_JWT_SECRET is not defined. Middleware cannot verify tokens.');
    console.log('Redirecting due to missing JWT secret.');
    // This is a server configuration error. For safety, we won't proceed.
    // In production, you might want to show a generic error page.
    return NextResponse.redirect(new URL('/login?error=server_config', request.url));
  }

  // Since the matcher is defined in `config`, this middleware only runs on protected routes.
  // The first step is to check for a session token.
  console.log('Checking for session token...');
  if (!sessionToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const secret = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(sessionToken, secret);

    console.log('JWT verification successful. Payload:', payload);
    // If the user is trying to access an admin route but doesn't have the admin role, redirect them.
    if (pathname.startsWith('/admin') && payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    console.log('User is authorized to access the route.');

    return NextResponse.next();
  } catch (err) {
    console.error('JWT Verification Error:', err.message);
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