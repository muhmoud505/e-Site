/**
 * 🟢 Secure CORS configuration
 * Only allows specific origins, not wildcards
 */

const ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'https://your-domain.com',
    // Add your production domains here
];

const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'DELETE'];
const ALLOWED_HEADERS = ['Content-Type', 'Authorization'];
const MAX_AGE = 86400; // 24 hours

/**
 * Apply CORS headers to a response
 */
export function applyCors(request, response) {
    const origin = request.headers.get('origin');

    // 🟢 Only allow whitelisted origins
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Methods', ALLOWED_METHODS.join(', '));
        response.headers.set('Access-Control-Allow-Headers', ALLOWED_HEADERS.join(', '));
        response.headers.set('Access-Control-Allow-Credentials', 'true');
        response.headers.set('Access-Control-Max-Age', MAX_AGE.toString());
    }
    // If origin is NOT in whitelist → No CORS headers → Browser blocks the request

    return response;
}

/**
 * Handle CORS preflight requests
 */
export function handlePreflight(request) {
    const origin = request.headers.get('origin');
    
    // Only respond to preflight from allowed origins
    if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
        return new Response(null, { status: 204 });
    }

    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Methods': ALLOWED_METHODS.join(', '),
            'Access-Control-Allow-Headers': ALLOWED_HEADERS.join(', '),
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Max-Age': MAX_AGE.toString(),
        },
    });
}