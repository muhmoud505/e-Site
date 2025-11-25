'use server';

import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

/**
 * Caches the JWT secret key.
 * @type {Uint8Array | undefined}
 */
let secretKey;

/**
 * Lazily initializes and returns the JWT secret key.
 * Throws an error if the JWT_SECRET environment variable is not set.
 * @returns {Uint8Array} The encoded secret key.
 */
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

/**
 * Verifies the JWT from the session cookie and returns the payload.
 * @returns {Promise<object | null>} The session payload or null if not authenticated.
 */
export async function getSession() {
  const sessionToken = cookies().get('session_token')?.value;

  if (!sessionToken) return null;

  try {
    const { payload } = await jwtVerify(sessionToken, getSecretKey());
    return payload;
  } catch (error) {
    // In development, log the error for debugging.
    // In production, you might want to avoid this to prevent log spam.
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to verify session token:', error.message);
    }
    return null; // Token is invalid or expired
  }
}