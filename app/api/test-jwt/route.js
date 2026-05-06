import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function GET(request) {
    const token = request.cookies.get('session')?.value;
    
    if (!token) {
        return NextResponse.json({ error: "No token" }, { status: 401 });
    }

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        return NextResponse.json({ 
            message: "Access granted", 
            user: payload 
        });
    } catch (error) {
        return NextResponse.json({ 
            error: "Invalid token",
            detail: error.message 
        }, { status: 401 });
    }
}