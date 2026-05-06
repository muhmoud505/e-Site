import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import db from "@/lib/db";

export async function GET(request) {
    const token = request.cookies.get('session')?.value;
    
    if (!token) {
        return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        
        // 🔴 VULNERABLE: Using ID from token without re-verification
        const [rows] = await db.query(
            'SELECT id, email, name, role FROM users WHERE id = ?',
            [payload.id || payload.sub]
        );

        if (rows.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ user: rows[0] });

    } catch (error) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
}