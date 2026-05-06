import { NextResponse } from "next/server";
import crypto from "crypto";
import db from "@/lib/db";

export async function POST(request) {
    const { email } = await request.json();

    // 🔴 VULNERABLE: Predictable token
    const resetToken = crypto.randomBytes(3).toString('hex'); // Only 6 hex chars!
    
    // Store token
    await db.query(
        'UPDATE users SET reset_token = ?, reset_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE email = ?',
        [resetToken, email]
    );

    console.log('Reset token:', resetToken); // 🔴 Logging sensitive data!

    return NextResponse.json({ 
        message: "If that email exists, a reset link has been sent.",
        // 🔴 DON'T return token in production - just for learning
        debug_token: resetToken 
    });
}