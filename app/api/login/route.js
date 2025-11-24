import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import db from '@/lib/db';

/**
 * Handles POST requests to /api/login
 * @param {import('next/server').NextRequest} request
 */
export async function POST(request) {
  // Define a schema for validation using Zod
  const loginSchema = z.object({
    email: z.string().email({ message: 'Invalid email address.' }),
    password: z.string().min(1, { message: 'Password is required.' }),
  });

  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid input.', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { email, password } = validation.data;

    // Find the user by email
    const [[user]] = await db.query(
      'SELECT id, fullname, email, role, password FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
    }

    // Compare the provided password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
    }

    // --- Create a JWT session token ---
    // Prepare user data for the token payload (exclude password)
    const userPayload = {
      id: user.id,
      fullname: user.fullname,
      email: user.email,
      role: user.role,
    };

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const alg = 'HS256';

    const sessionToken = await new SignJWT(userPayload)
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime('30d') // Set session to expire in 30 days
      .sign(secret);

    const cookieStore = cookies();
    // Set the session token in an HTTP-only cookie
    cookieStore.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return NextResponse.json({ user: userPayload }, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}