import { NextResponse } from "next/server";
import db from "@/lib/db";
export async function Get(request){
    const {searchParams}=new URL(request.url);
    const query =searchParams.get('q')|| '';
    try{

        const sqlQuery=`
        SELECT 
         p.*,
         c.name as catagory,
         (SELECT image_url FROM product_images WHERE product_id=p.id ORDER BY sort_order ASC LIMIT 1) as image
         FROM products p LEFT JOIN categories c ON p.catagory_id=c.id
         WHERE p.name LIKE '%${query}%' OR p.description LIKE '%${query}%'
         ORDER BY p.created_at DESC
        `;
        console.log('🔴 Executing vulnerable query:', sqlQuery);
        const [rows]=await db.query(sqlQuery)
        return NextResponse.json({
            results:rows,
            query:sqlQuery,
            count:rows.length
        })
    }catch(error){
        console.error('Search error: ',error);
        return NextResponse.json({
            error:error.message,
            query:sqlQuery
        }
    ,{status:500}
    )
    }
}