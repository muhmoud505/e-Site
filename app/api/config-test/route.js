import { NextResponse } from "next/server";
import fs from "fs";

export async function GET() {
    try {
        // 🔴 MISCONFIGURED: Reading file with verbose errors
        const data = fs.readFileSync("./config/database.json", "utf8");
        return NextResponse.json(JSON.parse(data));
    } catch (error) {
        // 🔴 EXPOSING FULL ERROR DETAILS!
        return NextResponse.json({
            error: error.message,
            stack: error.stack,
            code: error.code,
            path: error.path,
            // This reveals your server's file structure!
        }, { status: 500 });
    }
}