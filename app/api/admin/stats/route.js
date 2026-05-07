import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
    // 🔴 VULNERABLE: No authentication at all!
    try {
        const [[{ userCount }]] = await db.query('SELECT COUNT(*) as userCount FROM users');
        const [[{ productCount }]] = await db.query('SELECT COUNT(*) as productCount FROM products');
        const [[{ orderCount }]] = await db.query('SELECT COUNT(*) as orderCount FROM orders');

        return NextResponse.json({
            users: userCount,
            products: productCount,
            orders: orderCount,
            message: "This admin data is exposed with NO authentication!"
        });

    } catch (error) {
        console.error("Stats error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}