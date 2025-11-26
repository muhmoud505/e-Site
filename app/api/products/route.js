import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT p.*, c.name as category 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const data = await req.formData();

    // --- 1. Get all fields from FormData ---
    const name = data.get('name');
    const description = data.get('description');
    const price = data.get('price');
    const stock = data.get('stock');
    const categoryName = data.get('category');
    const slug = data.get('slug');
    const imageFile = data.get('image');

    if (!name || !price || !stock || !categoryName || !slug || !imageFile) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // --- 2. Handle file upload ---
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename to avoid overwrites
    const fileExtension = path.extname(imageFile.name);
    const fileName = `${slug}-${Date.now()}${fileExtension}`;
    
    // Define the path to save the file
    const uploadDir = path.join(process.cwd(), 'public/products');
    const filePath = path.join(uploadDir, fileName);

    // Save the file to the filesystem
    await writeFile(filePath, buffer);

    // The path to be stored in the database
    const dbImagePath = `/products/${fileName}`;

    // --- 3. Get category ID from database ---
    const [[category]] = await db.query('SELECT id FROM categories WHERE name = ?', [categoryName]);
    if (!category) {
      return NextResponse.json({ message: 'Invalid category' }, { status: 400 });
    }
    const category_id = category.id;

    // --- 4. Insert product into database ---
    const query = 'INSERT INTO products (name, slug, description, price, stock, image, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const values = [name, slug, description, parseFloat(price), parseInt(stock, 10), dbImagePath, category_id];
    
    await db.query(query, values);

    return NextResponse.json({ message: 'Product created successfully' }, { status: 201 });

  } catch (error) {
    console.error('Failed to create product:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}