import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
    try {
        // 🔴 MISCONFIGURED: Lists all files in directory!
        const dirPath = path.join(process.cwd(), "public");
        const files = fs.readdirSync(dirPath, { withFileTypes: true });
        
        const listing = files.map(file => ({
            name: file.name,
            type: file.isDirectory() ? "directory" : "file",
            path: `/public/${file.name}`
        }));

        return NextResponse.json({
            directory: dirPath,
            files: listing,
            readable: true  // 🔴 Anyone can see all files!
        });
    } catch (error) {
        return NextResponse.json({ files: [], error: error.message });
    }
}