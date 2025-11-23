import { NextResponse } from 'next/server';
import db from '@/lib/db';

/**
 * Handles GET requests to /api/products to fetch all products.
 * @param {import('next/server').NextRequest} request
 */
export async function GET(request) {
  try {
    // Query to get all products and join with categories to get the category name
    const [products] = await db.query(
      `SELECT p.*, c.name as categoryName FROM products p LEFT JOIN categories c ON p.category_id = c.id`
    );

    return NextResponse.json(products);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}