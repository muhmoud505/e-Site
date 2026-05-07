import { NextResponse } from "next/server";
import os from "os";

export async function GET() {
    // 🔴 DEBUG ENDPOINT LEFT IN PRODUCTION!
    return NextResponse.json({
        app: {
            name: "e-Site",
            version: "1.0.0",
            environment: process.env.NODE_ENV || "development",
            debug: true  // 🔴 Debug mode ON!
        },
        server: {
            platform: os.platform(),
            hostname: os.hostname(),
            cpus: os.cpus().length,
            memory: Math.round(os.totalmem() / 1024 / 1024 / 1024) + " GB",
            uptime: Math.round(os.uptime() / 3600) + " hours",
            nodeVersion: process.version,
        },
        paths: {
            home: os.homedir(),
            current: process.cwd(),
            temp: os.tmpdir(),
        },
        env: Object.keys(process.env).filter(k => 
            !k.includes('SECRET') && !k.includes('KEY')
        )
    });
}