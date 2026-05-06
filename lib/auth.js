import { SignJWT, jwtVerify } from "jose";
import db from "./db";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

// 🟢 Generate JWT with minimal data
export async function createSession(userId) {
    const token = await new SignJWT({ sub: userId })  // Only store ID
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1h')  // 🟢 Short expiry (1 hour)
        .sign(SECRET);
    
    return token;
}

// 🟢 Verify JWT and return fresh user data
export async function getCurrentUser(request) {
    const token = request.cookies.get('session')?.value;
    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, SECRET);
        
        // 🟢 Fetch fresh data from DB (not from token)
        const [rows] = await db.query(
            'SELECT id, email, name, role FROM users WHERE id = ?',
            [payload.sub]
        );
        
        return rows[0] || null;
    } catch {
        return null;
    }
}

// 🟢 Rate limiting helper
const attempts = new Map();
export function checkRateLimit(key, maxAttempts = 5, windowMs = 900000) {
    const now = Date.now();
    const record = attempts.get(key) || { count: 0, resetAt: now + windowMs };
    
    if (now > record.resetAt) {
        record.count = 1;
        record.resetAt = now + windowMs;
    } else {
        record.count++;
    }
    
    attempts.set(key, record);
    return record.count > maxAttempts;
}

// 🟢 Validate password strength
export function validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*]/.test(password);
    
    const errors = [];
    if (password.length < minLength) errors.push("At least 8 characters");
    if (!hasUpperCase) errors.push("One uppercase letter");
    if (!hasLowerCase) errors.push("One lowercase letter");
    if (!hasNumbers) errors.push("One number");
    if (!hasSpecial) errors.push("One special character");
    
    return errors;
}

// 🟢 Generate secure password reset token
export function generateResetToken() {
    return crypto.randomBytes(32).toString('hex'); // 64 hex characters!
}