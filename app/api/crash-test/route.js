import { NextResponse } from "next/server";

export async function GET() {
    try {
        // Simulate an error
        throw new Error("Database connection failed at 192.168.1.100:3306");
    } catch (error) {
        // 🔴 EXPOSING FULL STACK TRACE IN PRODUCTION!
        return NextResponse.json({
            error: error.message,
            stack: error.stack,  // Shows file paths and line numbers
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}