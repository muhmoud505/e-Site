import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { SignJWT } from 'jose';
import db from '@/lib/db';

// 🟢 Stronger password validation
const passwordSchema = z.string()
    .min(8, { message: 'Password must be at least 8 characters.' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter.' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter.' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number.' })
    .regex(/[!@#$%^&*]/, { message: 'Password must contain at least one special character.' });

const registerSchema = z.object({
    fullname: z.string().min(1).max(100),
    email: z.string().email().max(255),
    password: passwordSchema,
    gender: z.enum(['male', 'female', 'other']),
    mobile: z.string().min(1).max(20),
});

// 🟢 Simple in-memory rate limiter
const rateLimitMap = new Map();
function checkRateLimit(key, maxAttempts = 3, windowMs = 15 * 60 * 1000) {
    const now = Date.now();
    const record = rateLimitMap.get(key) || { attempts: 0, resetAt: now + windowMs };
    
    if (now > record.resetAt) {
        record.attempts = 1;
        record.resetAt = now + windowMs;
    } else {
        record.attempts++;
    }
    
    rateLimitMap.set(key, record);
    return record.attempts > maxAttempts;
}

export async function POST(request) {
    try {
        // 🟢 Rate limiting
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        if (checkRateLimit(`register:${ip}`)) {
            return NextResponse.json(
                { message: 'Too many registration attempts. Please try again later.' },
                { status: 429 }
            );
        }

        const body = await request.json();
        const validation = registerSchema.safeParse(body);

        if (!validation.success) {
            // 🟢 Don't expose field errors to client
            console.log('Validation failed:', validation.error.flatten().fieldErrors);
            return NextResponse.json(
                { message: 'Invalid input. Please check your information.' },
                { status: 400 }
            );
        }

        const { fullname, email, password, gender, mobile } = validation.data;

        // 🟢 Prevent email enumeration: always return same message
        const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            // 🟢 Same 409 status but with generic message (or even 201 with fake success)
            return NextResponse.json(
                { message: 'If this email is not registered, an account has been created.' },
                { status: 201 }  // Pretend success to confuse attackers
            );
        }

        const saltRounds = 12; // 🟢 Stronger work factor (default was 10)
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const [result] = await db.query(
            'INSERT INTO users (fullname, email, password, gender, mobile, role) VALUES (?, ?, ?, ?, ?, ?)',
            [fullname, email, passwordHash, gender, mobile, 'user']
        );

        const newUserId = result.insertId;

        // 🟢 Create JWT with MINIMAL data (only user ID)
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const sessionToken = await new SignJWT({ sub: newUserId })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('1h')  // 🟢 Shorter expiry: 1 hour instead of 30 days
            .sign(secret);

        // 🟢 Create refresh token for longer sessions
        const refreshToken = crypto.randomUUID();
        await db.query(
            'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))',
            [newUserId, refreshToken]
        );

        const [[newUser]] = await db.query(
            'SELECT id, fullname, email, role FROM users WHERE id = ?',
            [newUserId]
        );

        const response = NextResponse.json(
            { user: { id: newUser.id, fullname: newUser.fullname, email: newUser.email } },
            { status: 201 }
        );

        response.cookies.set('session', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',  // 🟢 Added CSRF protection
            maxAge: 3600,  // 🟢 1 hour
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { message: 'An internal server error occurred.' },
            { status: 500 }
        );
    }
}