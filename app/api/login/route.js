import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { z } from "zod";
import db from "@/lib/db";
import { createSession, checkRateLimit } from "@/lib/auth";

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // 🟢 Rate limiting
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        if (checkRateLimit(`login:${ip}`)) {
            return NextResponse.json(
                { message: "Too many attempts. Try again in 15 minutes." },
                { status: 429 }
            );
        }

        // 🟢 Prevent timing-based user enumeration
        const dummyHash = '$2b$10$abcdefghijklmnopqrstuABCDEFGHIJKLMNOPQRSTUVWXYZ12345';
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];
        const passwordHash = user ? user.password : dummyHash;
        const match = await bcrypt.compare(password, passwordHash);

        if (!user || !match) {
            return NextResponse.json(
                { message: "Invalid email or password." },
                { status: 401 }
            );
        }

        // 🟢 Create session with minimal data
        const token = await createSession(user.id);

        const response = NextResponse.json(
            { user: { id: user.id, email: user.email, name: user.name } },
            { status: 200 }
        );

        response.cookies.set('session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600, // 1 hour
            path: '/',
        });

        return response;

    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { message: "An internal error occurred." },
            { status: 500 }
        );
    }
}