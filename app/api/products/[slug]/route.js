import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { writeFile, unlink, mkdir, rm } from 'fs/promises'; // For file system operations
import path from 'path';
import { jwtVerify } from 'jose';

// Helper to verify JWT from cookies
async function getAuthPayload(request) {
  const sessionToken = request.cookies.get('session_token')?.value;
  if (!sessionToken) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(sessionToken, secret);
    return payload;
  } catch (e) {
    console.error('Auth payload error:', e.message);
    return null;
  }
}

// GET a single product by ID
export async function GET(request, { params }) {
  const { slug: id } = await params; // Use 'id' as the variable name for clarity
  try {
    const [rows] = await db.query(`
      SELECT 
        p.*, 
        p.stock > 0 as inStock,
        p.original_price as originalPrice,
        c.name as category_name,
        COALESCE(GROUP_CONCAT(pi.image_url ORDER BY pi.sort_order ASC), '') as images
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE p.id = ?
      GROUP BY p.id
    `, [id]);

    if (rows.length === 0) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const product = rows[0];
    // Convert the comma-separated image string into an array
    product.images = product.images ? product.images.split(',') : [];
    product.image = product.images[0] || null; // Set main image for compatibility

    return NextResponse.json(product);
  } catch (error) {
    console.error(`Failed to fetch product ${id}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// UPDATE a product by ID
export async function PUT(request, { params }) {
  const { slug: id } = await params; // Correctly get the ID from the 'slug' parameter

  const authPayload = await getAuthPayload(request);
  if (!authPayload || authPayload.role !== 'admin') {
    return NextResponse.json({ message: 'Authentication failed or insufficient permissions' }, { status: 403 });
  }

  try {
    const data = await request.formData();

    // --- 1. Get text fields from FormData ---
    const name = data.get('name');
    const description = data.get('description');
    const price = data.get('price');
    const originalPrice = data.get('originalPrice'); // Get originalPrice from form
    const stock = data.get('stock');
    const categoryName = data.get('category');
    const slug = data.get('slug');

    // Handle optional originalPrice. If empty, store as NULL.
    const finalOriginalPrice = originalPrice && parseFloat(originalPrice) > 0 ? parseFloat(originalPrice) : null;

    // --- 2. Get category ID from its name ---
    const [[category]] = await db.query('SELECT id FROM categories WHERE name = ?', [categoryName]);
    if (!category) {
      return NextResponse.json({ message: 'Invalid category specified' }, { status: 400 });
    }

    // --- 3. Update product's main data in the database, including original_price ---
    const productQuery = 'UPDATE products SET name=?, slug=?, description=?, price=?, original_price=?, stock=?, category_id=? WHERE id=?';
    const productValues = [name, slug, description, parseFloat(price), finalOriginalPrice, parseInt(stock, 10), category.id, id];
    await db.query(productQuery, productValues);

    // --- 4. Handle Image Updates ---
    const productImagesDir = path.join(process.cwd(), 'public/products', String(id));
    await mkdir(productImagesDir, { recursive: true });

    // A. Determine which images to delete
    const existingImagesToKeep = data.getAll('existingImages[]');
    const [currentImagesInDb] = await db.query('SELECT image_url FROM product_images WHERE product_id = ?', [id]);
    const imagesToDelete = currentImagesInDb.filter(img => !existingImagesToKeep.includes(img.image_url));

    // B. Delete images from filesystem and database
    for (const img of imagesToDelete) {
      const imagePath = path.join(process.cwd(), 'public', img.image_url);
      await unlink(imagePath).catch(err => console.error(`Failed to delete image file: ${imagePath}`, err));
      await db.query('DELETE FROM product_images WHERE product_id = ? AND image_url = ?', [id, img.image_url]);
    }

    // C. Add new images
    const newImageFiles = data.getAll('images');
    const imageInsertPromises = newImageFiles.map(async (imageFile, index) => {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileExtension = path.extname(imageFile.name);
      const fileName = `img-${Date.now()}-${index}${fileExtension}`;
      const filePath = path.join(productImagesDir, fileName);

      await writeFile(filePath, buffer);

      const dbImagePath = `/products/${id}/${fileName}`;
      const imageQuery = 'INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)';
      // Note: A more robust sort_order would re-order all images, but this is simpler.
      const imageValues = [id, dbImagePath, existingImagesToKeep.length + index];
      return db.query(imageQuery, imageValues);
    });
    await Promise.all(imageInsertPromises);

    return NextResponse.json({ message: 'Product updated successfully' }, { status: 200 });

  } catch (error) {
    console.error(`Failed to update product ${id}:`, error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

// DELETE a product by ID
export async function DELETE(request, { params }) {
  const { slug: id } = await params; // Correctly get the ID from the 'slug' parameter

  const authPayload = await getAuthPayload(request);
  if (!authPayload || authPayload.role !== 'admin') {
    return NextResponse.json({ message: 'Authentication failed or insufficient permissions' }, { status: 403 });
  }

  try {
    // --- 1. Check if product exists ---
    const [[product]] = await db.query('SELECT id FROM products WHERE id = ?', [id]);
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    // --- 2. Delete the product's image folder from the filesystem ---
    const productImagesDir = path.join(process.cwd(), 'public/products', String(id));
    await rm(productImagesDir, { recursive: true, force: true }).catch(err =>
      console.error(`Could not delete directory ${productImagesDir}, it may not exist:`, err.message)
    );

    // --- 3. Delete the product from the database ---
    // Assuming `ON DELETE CASCADE` is set on the `product_images` foreign key,
    // this will automatically delete the associated image records.
    await db.query('DELETE FROM products WHERE id = ?', [id]);

    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Failed to delete product ${id}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}