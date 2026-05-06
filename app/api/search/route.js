import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    try {
        // 🔴 VULNERABLE: No ORDER BY to block UNION
        const sqlQuery = `
        SELECT
         p.*,
         c.name as category,
         (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY sort_order ASC LIMIT 1) as image
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE p.name LIKE '%${query}%'
        `;
        
        console.log('🔴 Executing:', sqlQuery);
        const [rows] = await db.query(sqlQuery);
        
        return NextResponse.json({
            results: rows,
            query: sqlQuery,
            count: rows.length
        });
        
    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json({
            error: error.message
        }, { status: 500 });
    }
}