/**
 * 🟢 Strip sensitive data from objects before sending to client
 */
export function sanitizeUser(user) {
    if (!user) return null;
    const { password, reset_token, reset_expires, ...safe } = user;
    return safe;
}

/**
 * 🟢 Generic error response (no details exposed)
 */
export function errorResponse(message = 'An error occurred', status = 500) {
    return NextResponse.json({ message }, { status });
}

/**
 * 🟢 Add security headers to all responses
 */
export function secureHeaders(response) {
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    return response;
}

/**
 * 🟢 Validate and sanitize input
 */
export function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return input
        .trim()
        .replace(/[<>]/g, '')  // Remove HTML tags
        .slice(0, 5000);        // Limit length
}