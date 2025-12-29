import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT 
        p.*, 
        c.name as category,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY sort_order ASC LIMIT 1) as image,
        GROUP_CONCAT(pi.image_url ORDER BY pi.sort_order ASC) as images
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);

    const products = rows.map(product => ({
      ...product,
      images: product.images ? product.images.split(',') : []
    }));

    return NextResponse.json(products);
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
    const imageFiles = data.getAll('images');

    if (!name || !price || !stock || !categoryName || !slug || imageFiles.length === 0) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // --- 3. Get category ID from database ---
    const [[category]] = await db.query('SELECT id FROM categories WHERE name = ?', [categoryName]);
    if (!category) {
      return NextResponse.json({ message: 'Invalid category' }, { status: 400 });
    }

    // --- 4. Insert product into database ---
    const productQuery = 'INSERT INTO products (name, slug, description, price, stock, category_id) VALUES (?, ?, ?, ?, ?, ?)';
    const productValues = [name, slug, description, parseFloat(price), parseInt(stock, 10), category.id];
    
    const [result] = await db.query(productQuery, productValues);
    const productId = result.insertId;

    // --- 5. Create a dedicated folder for the product's images ---
    const productImagesDir = path.join(process.cwd(), 'public/products', String(productId));
    await mkdir(productImagesDir, { recursive: true });

    // --- 6. Handle multiple file uploads and insert into product_images ---
    const imageInsertPromises = imageFiles.map(async (imageFile, index) => {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // The filename can be simpler as it's inside a unique product folder
      const fileExtension = path.extname(imageFile.name);
      const fileName = `image-${index + 1}${fileExtension}`;
      const filePath = path.join(productImagesDir, fileName);

      // Save the file
      await writeFile(filePath, buffer);

      // The path stored in the DB now includes the product ID folder
      const dbImagePath = `/products/${productId}/${fileName}`;
      const imageQuery = 'INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)';
      const imageValues = [productId, dbImagePath, index];
      
      return db.query(imageQuery, imageValues);
    });

    // Wait for all image processing and DB insertions to complete
    await Promise.all(imageInsertPromises);

    return NextResponse.json({ message: 'Product created successfully' }, { status: 201 });

  } catch (error) {
    console.error('Failed to create product:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}