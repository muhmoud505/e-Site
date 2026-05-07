import { NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";

export async function POST(request) {
    try {
        const xmlData = await request.text();
        
        console.log('🔴 Parsing XML:', xmlData);

        // 🔴 VULNERABLE: XXE enabled by default in many parsers!
        const parser = new XMLParser({
            ignoreAttributes: false,
            allowBooleanAttributes: true,
            // 🔴 THESE MAKE XXE POSSIBLE!
            processEntities: true,  // Processes external entities
            htmlEntities: true,     // Processes HTML entities
        });

        const parsed = parser.parse(xmlData);
        
        return NextResponse.json({
            message: "XML parsed successfully",
            data: parsed
        });

    } catch (error) {
        console.error('XML parse error:', error);
        return NextResponse.json({
            error: error.message
        }, { status: 400 });
    }
}