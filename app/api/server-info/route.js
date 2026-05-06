import { NextResponse } from "next/server";
import os from "os";

export async function GET() {
    // 🔴 EXPOSING SERVER INFORMATION!
    return NextResponse.json({
        platform: os.platform(),
        hostname: os.hostname(),
        cpus: os.cpus().length,
        memory: {
            total: Math.round(os.totalmem() / 1024 / 1024) + " MB",
            free: Math.round(os.freemem() / 1024 / 1024) + " MB"
        },
        uptime: Math.round(os.uptime() / 3600) + " hours",
        nodeVersion: process.version,
        env: process.env.NODE_ENV,
        // 🔴 UNCOMMENT TO SEE THE DANGER:
        // databaseUrl: process.env.DATABASE_URL,
        // jwtSecret: process.env.JWT_SECRET,
    });
}