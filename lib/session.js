'use server';

import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

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
    return payload;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to get/verify session:', error.message);
    }
    return null;
  }
}