import ProductList from '@/components/ProductList';
import db from "@/lib/db";

// This forces the page to be rendered dynamically on the server
export const dynamic = 'force-dynamic';

async function getDiscountedProducts() {
  try {
    // This query is now optimized to only fetch products that are on sale.
    // It assumes you have an `original_price` column in your `products` table.
    const [rows] = await db.query(`
      SELECT 
        p.*, 
        p.stock > 0 as inStock,
        c.name as category,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY sort_order ASC LIMIT 1) as image, 
        COALESCE(GROUP_CONCAT(pi.image_url ORDER BY pi.sort_order ASC), '') as images,
        p.original_price as originalPrice,
        p.price as price,
        (SELECT COUNT(*) FROM reviews WHERE product_id = p.id) as reviewCount,
        (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE product_id = p.id) as averageRating
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE p.original_price IS NOT NULL AND p.original_price > p.price
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT 20
    `);
    // Mocking review data that is not in the DB schema yet.
    return rows.map(p => ({ ...p, images: p.images ? p.images.split(',') : [], rating: Number(p.averageRating), reviewCount: Number(p.reviewCount) }));
  } catch (error) {
    console.error("Failed to fetch discounted products:", error);
    return [];
  }
}

export default async function SalesPage() {
  const discountedProducts = await getDiscountedProducts();

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800">العروض الخاصة</h1>
          <p className="text-gray-600 mt-2">
            لا تفوت فرصة الحصول على أفضل المنتجات بأسعار مخفضة!
          </p>
        </div>
        <ProductList products={discountedProducts} />
      </div>
    </div>
  );
}
