import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
    try {
        // 🔴 RETURNS ALL USERS WITH ALL FIELDS!
        const [users] = await db.query('SELECT * FROM users');
        
        return NextResponse.json({
            count: users.length,
            users: users  // Includes password hashes!
        });
    } catch (error) {
        // 🔴 Exposes error details
        return NextResponse.json({ 
            error: error.message,
            sql: error.sql
        }, { status: 500 });
    }
}