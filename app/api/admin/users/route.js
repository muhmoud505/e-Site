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

        // 🔴 VULNERABLE: Only checks if role exists in JWT, not from database!
        if (payload.role !== 'admin') {
            return NextResponse.json({ error: "Admins only" }, { status: 403 });
        }

        // Admin functionality
        const [users] = await db.query('SELECT id, fullname, email, role FROM users');
        return NextResponse.json({ users });

    } catch (error) {
        return NextResponse.json({ error: "Invalid token  ",error }, { status: 401 });
    }
}