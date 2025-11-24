import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Handles POST requests to /api/logout to clear the session cookie.
 * @param {import('next/server').NextRequest} request
 */
export async function POST(request) {
  const cookieStore = cookies();

  // To "delete" a cookie, we set it again with an expiration date in the past.
  cookieStore.set('session_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0), // Set expiration to the past
    path: '/',
  });

  return NextResponse.json({ message: 'Logout successful' }, { status: 200 });
}