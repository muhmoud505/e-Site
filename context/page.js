import db from "@/lib/db";
import { notFound } from 'next/navigation';
import ProductClient from "@/components/ProductClient";

export const dynamic = 'force-dynamic';

async function getProduct(slug) {
  try {
    // This assumes you have a 'slug' column in your products table
    const [rows] = await db.query(`
      SELECT 
        p.*, 
        p.stock > 0 as inStock,
        c.name as category,
        COALESCE(GROUP_CONCAT(pi.image_url ORDER BY pi.sort_order ASC), '') as images
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE p.slug = ?
      GROUP BY p.id
      LIMIT 1
    `, [slug]);

    if (rows.length === 0) {
      return null;
    }

    const product = rows[0];
    // Mocking some data that is not in the DB schema yet.
    const fullProduct = { ...product, images: product.images.split(','), originalPrice: product.price * 1.25, rating: 4.5, reviews: 95 };

    return fullProduct;

  } catch (error) {
    console.error("Failed to fetch product:", error);
    return null;
  }
}

export default async function ProductPage({ params }) {
  const product = await getProduct(params.slug);

  if (!product) {
    notFound(); // This will render your custom not-found.js page
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <ProductClient product={product} />
    </div>
  );
}