import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import db from '../../../lib/db';

export async function POST() {
  const cookieStore = cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;

  // Invalidate the refresh token in the database
  if (refreshToken) {
    await db.query('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken]);
  }

  // Clear the cookies
  cookieStore.set('session_token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });
  cookieStore.set('refresh_token', '', { httpOnly: true, expires: new Date(0), path: '/' });

  return NextResponse.json({ success: true });
}