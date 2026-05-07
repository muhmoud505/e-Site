import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request, { params }) {
    try {
        const { id } = await params;

        // 🔴 IDOR VULNERABLE: No ownership check
        const [rows] = await db.query(
            'SELECT id, fullname, email, gender, mobile, role FROM users WHERE id = ?',
            [id]
        );

        if (rows.length === 0) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ user: rows[0] });

    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}