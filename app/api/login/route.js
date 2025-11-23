import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import db from '../../../lib/db';
import { SignJWT } from 'jose';

export async function POST() {
  const cookieStore = cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: 'Refresh token not found' }, { status: 401 });
  }

  // 1. Find the refresh token in the database
  const [tokens] = await db.query(
    'SELECT rt.id, rt.user_id, rt.expires_at, u.id as userId, u.email, u.fullname, u.role FROM refresh_tokens rt JOIN users u ON rt.user_id = u.id WHERE rt.token = ?',
    [refreshToken]
  );

  if (tokens.length === 0) {
    return NextResponse.json({ message: 'Invalid refresh token' }, { status: 401 });
  }

  const tokenData = tokens[0];

  // 2. Check if the token has expired
  if (new Date(tokenData.expires_at) < new Date()) {
    // Clean up expired token
    await db.query('DELETE FROM refresh_tokens WHERE id = ?', [tokenData.id]);
    return NextResponse.json({ message: 'Refresh token expired' }, { status: 401 });
  }

  // 3. Generate a new access token
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const alg = 'HS256';

  const newAccessToken = await new SignJWT({
    userId: tokenData.userId,
    email: tokenData.email,
    fullname: tokenData.fullname,
    role: tokenData.role,
  })
    .setProtectedHeader({ alg })
    .setExpirationTime('15m') // New short-lived token
    .setIssuedAt()
    .sign(secret);

  // 4. Set the new access token cookie
  cookieStore.set('session_token', newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 15, // 15 minutes
    path: '/',
  });

  return NextResponse.json({ message: 'Token refreshed successfully' }, { status: 200 });
}