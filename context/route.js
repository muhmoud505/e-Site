import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';

// Helper to save file to disk
async function saveFile(file) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  // Create unique filename
  const filename = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  const filepath = path.join(uploadDir, filename);
  
  // Ensure directory exists (optional, usually public/uploads should exist)
  try {
    await writeFile(filepath, buffer);
    return `/uploads/${filename}`;
  } catch (error) {
    console.error('Error saving file:', error);
    throw new Error('Failed to save image');
  }
}

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const pool = await db.getConnection();

    // Fetch product
    const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    
    if (products.length === 0) {
      pool.release();
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const product = products[0];

    // Fetch images
    const [images] = await pool.query(
      'SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order ASC', 
      [id]
    );

    pool.release();

    // Combine data
    product.images = images.map(img => img.image_url);

    return NextResponse.json(product);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const formData = await req.formData();
    
    const name = formData.get('name');
    const description = formData.get('description');
    const price = formData.get('price');
    const stock = formData.get('stock');
    const category = formData.get('category');
    const slug = formData.get('slug');
    
    // existingImages is an array of strings (URLs)
    const existingImages = formData.getAll('existingImages[]');
    // newImages is an array of Files
    const newImages = formData.getAll('images');

    const pool = await db.getConnection();

    // 1. Update Product Details
    // First get category_id
    const [catResult] = await pool.query('SELECT id FROM categories WHERE name = ?', [category]);
    const categoryId = catResult.length > 0 ? catResult[0].id : null;

    await pool.query(
      'UPDATE products SET name=?, slug=?, description=?, price=?, stock=?, category_id=? WHERE id=?',
      [name, slug, description, price, stock, categoryId, id]
    );

    // 2. Handle Images
    // Get current images in DB to know what to delete
    const [currentDbImages] = await pool.query('SELECT image_url FROM product_images WHERE product_id = ?', [id]);
    const currentUrls = currentDbImages.map(img => img.image_url);

    // Determine images to delete (in DB but not in existingImages list)
    const imagesToDelete = currentUrls.filter(url => !existingImages.includes(url));

    // Delete removed images from DB and Filesystem
    for (const url of imagesToDelete) {
      await pool.query('DELETE FROM product_images WHERE product_id = ? AND image_url = ?', [id, url]);
      // Optional: Delete file from disk
      try {
        const filePath = path.join(process.cwd(), 'public', url);
        await unlink(filePath);
      } catch (err) {
        console.warn(`Could not delete file: ${url}`, err);
      }
    }

    // Upload and Insert New Images
    for (const file of newImages) {
      if (file instanceof File) {
        const imageUrl = await saveFile(file);
        await pool.query('INSERT INTO product_images (product_id, image_url) VALUES (?, ?)', [id, imageUrl]);
      }
    }

    pool.release();
    return NextResponse.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Update Error:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}