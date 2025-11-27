import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { writeFile, unlink, mkdir } from 'fs/promises';
import path from 'path';

// GET a single product
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const [[product]] = await db.query(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.id = ?
    `, [id]);

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// UPDATE a product
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.formData();

    const name = data.get('name');
    const description = data.get('description');
    const price = data.get('price');
    const stock = data.get('stock');
    const categoryName = data.get('category');
    const slug = data.get('slug');
    const imageFile = data.get('image');

    // --- Get existing product to find old image path ---
    const [[existingProduct]] = await db.query('SELECT image FROM products WHERE id = ?', [id]);
    if (!existingProduct) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    let dbImagePath = existingProduct.image;

    // --- If a new image is uploaded, handle it ---
    if (imageFile && imageFile.size > 0) {
      // Delete old image
      if (existingProduct.image) {
        const oldImagePath = path.join(process.cwd(), 'public', existingProduct.image);
        await unlink(oldImagePath).catch(err => console.error("Could not delete old image, it may not exist:", err.message));
      }

      // Save new image
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadDir = path.join(process.cwd(), 'public/products');
      await mkdir(uploadDir, { recursive: true }); // Ensure the directory exists
      const fileExtension = path.extname(imageFile.name);
      const fileName = `${slug}-${Date.now()}${fileExtension}`;
      const filePath = path.join(uploadDir, fileName);
      await writeFile(filePath, buffer);
      dbImagePath = `/products/${fileName}`;
    }

    // --- Get category ID ---
    const [[category]] = await db.query('SELECT id FROM categories WHERE name = ?', [categoryName]);
    if (!category) {
      return NextResponse.json({ message: 'Invalid category' }, { status: 400 });
    }

    // --- Update database ---
    const query = 'UPDATE products SET name=?, slug=?, description=?, price=?, stock=?, image=?, category_id=? WHERE id=?';
    const values = [name, slug, description, parseFloat(price), parseInt(stock, 10), dbImagePath, category.id, id];
    await db.query(query, values);

    return NextResponse.json({ message: 'Product updated successfully' }, { status: 200 });

  } catch (error) {
    console.error('Failed to update product:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

// DELETE a product
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // First, get the product to find the image path
    const [[product]] = await db.query('SELECT image FROM products WHERE id = ?', [id]);

    if (product && product.image) {
      // Delete the image file from the filesystem
      const imagePath = path.join(process.cwd(), 'public', product.image);
      await unlink(imagePath).catch(err => console.error("Could not delete image, it may not exist:", err.message));
    }

    // Then, delete the product from the database
    await db.query('DELETE FROM products WHERE id = ?', [id]);

    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}