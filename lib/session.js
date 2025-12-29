'use server';

import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import db from './db';

let secretKey;

function getSecretKey() {
  if (!secretKey) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set.');
    }
    secretKey = new TextEncoder().encode(secret);
  }
  return secretKey;
}

export async function getSession() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (!sessionToken) return null;

    const { payload } = await jwtVerify(sessionToken, getSecretKey());
    
    if (!payload?.id) return null;

    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [payload.id]);
    const user = users[0];

    if (!user) return null;

    const [addresses] = await db.query('SELECT * FROM user_addresses WHERE user_id = ?', [user.id]);
    const { password, ...userWithoutPassword } = user;

    return { ...payload, ...userWithoutPassword, addresses, address: addresses.find(addr => addr.is_default) || addresses[0] };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to get/verify session:', error.message);
    }
    return null;
  }
}

export async function createSession(userId) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const sessionToken = await new SignJWT({ id: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set('session_token', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session_token');
}