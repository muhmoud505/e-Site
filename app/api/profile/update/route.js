import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import db from "@/lib/db";

export async function PUT(request) {
    try {
        const token = request.cookies.get('session')?.value;
        
        if (!token) {
            return NextResponse.json({ error: "Not logged in" }, { status: 401 });
        }

        // Verify JWT
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        
        const body = await request.json();
        const { userId, fullname, email } = body;

        // 🔴 IDOR VULNERABLE: Uses userId from request instead of JWT
        // Attacker can send any userId and modify another user's profile!
        await db.query(
            'UPDATE users SET fullname = ?, email = ? WHERE id = ?',
            [fullname, email, userId]
        );

        return NextResponse.json({ 
            message: "Profile updated successfully",
            updatedUserId: userId
        });

    } catch (error) {
        console.error("Update error:", error);
        return NextResponse.json({ 
            error: error.message 
        }, { status: 500 });
    }
}