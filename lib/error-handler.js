import { NextResponse } from "next/server";

/**
 * 🟢 Centralized error handler
 * Logs full details internally, returns generic messages to client
 */
export function handleApiError(error, context = 'API') {
    // 🟢 Log full details for developers
    console.error(`[${context}] Error at ${new Date().toISOString()}:`);
    console.error('  Message:', error.message);
    console.error('  Code:', error.code);
    
    if (process.env.NODE_ENV === 'development') {
        console.error('  Stack:', error.stack?.split('\n').slice(0, 3).join('\n'));
    }
    console.error('---');

    // 🟢 Return safe response to client
    const errorId = Math.random().toString(36).substring(2, 10);
    
    return NextResponse.json(
        { 
            message: 'An unexpected error occurred.',
            errorId: errorId,  // Users can quote this to support
        },
        { status: 500 }
    );
}