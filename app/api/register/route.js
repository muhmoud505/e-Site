import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { SignJWT } from 'jose';
import db from '../../../lib/db';
import { cookies } from 'next/headers';

/**
 * Handles POST requests to /api/register
 * @param {import('next/server').NextRequest} request
 */
export async function POST(request) {
  // Define a schema for validation using Zod
  const registerSchema = z.object({
    fullname: z.string().min(1, { message: 'Full name is required.' }),
    email: z.string().email({ message: 'Invalid email address.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters long.' }),
    gender: z.enum(['male', 'female', 'other']),
    mobile: z.string().min(1, { message: 'Mobile number is required.' }),
  });

  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid input.', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { fullname, email, password, gender, mobile } = validation.data;

    // Check if the user already exists in the database.
    const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ?', [email])

    if (existingUsers.length > 0) {
      return NextResponse.json({ message: 'User with this email already exists.' }, { status: 409, statusText: 'Conflict' });
    }

    // It's good practice to use an environment variable for the salt rounds.
    const saltRounds = process.env.BCRYPT_SALT_ROUNDS ? parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) : 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Insert the new user into the database
    const [result] = await db.query(
      'INSERT INTO users (fullname, email, password, gender, mobile, role) VALUES (?, ?, ?, ?, ?, ?)',
      [fullname, email, passwordHash, gender, mobile, 'user']
    );

    const newUserId = result.insertId;

    // Fetch the newly created user's data (excluding password) to create the session
    const [[newUser]] = await db.query(
      'SELECT id, fullname, email, role FROM users WHERE id = ?',
      [newUserId]
    );

    if (!newUser) {
      return NextResponse.json({ message: 'Failed to retrieve user after creation.' }, { status: 500 });
    }

    // --- Create a JWT session token ---
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const alg = 'HS256';

    const sessionToken = await new SignJWT(newUser)
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime('30d') // Set session to expire in 30 days
      .sign(secret);

    // Create the response first
    const response = NextResponse.json({ user: newUser }, { status: 201 });

    // Set the session token in an HTTP-only cookie
    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    // Check for specific database errors, like unique constraint violations
    if (error.code === 'ER_DUP_ENTRY') {
        return NextResponse.json({ message: 'User with this email already exists.' }, { status: 409 });
    }
    return NextResponse.json(
      { message: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
