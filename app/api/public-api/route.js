import { NextResponse } from "next/server";

export async function GET(request) {
    const origin = request.headers.get('origin');
    
    const data = {
        users: [
            { id: 1, email: "admin@test.com", role: "admin" },
            { id: 2, email: "user@test.com", role: "user" }
        ],
        config: {
            apiUrl: process.env.NEXT_PUBLIC_API_URL,
            environment: process.env.NODE_ENV
        }
    };

    const response = NextResponse.json(data);
    
    // 🔴 MISCONFIGURED CORS!
    response.headers.set('Access-Control-Allow-Origin', origin || '*');  // Reflects ANY origin!
    response.headers.set('Access-Control-Allow-Methods', '*');  // All methods
    response.headers.set('Access-Control-Allow-Headers', '*');  // All headers
    response.headers.set('Access-Control-Allow-Credentials', 'true');  // With credentials!
    
    return response;
}