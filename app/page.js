import ProductList from '@/components/ProductList';
import Link from 'next/link';
import db from "@/lib/db";

// This forces the page to be rendered dynamically on the server
export const dynamic = 'force-dynamic';

async function getProducts() {
  try {
    const [rows] = await db.query(`
      SELECT 
        p.*, 
        p.stock > 0 as inStock,
        c.name as category,
        p.original_price as originalPrice,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY sort_order ASC LIMIT 1) as image, 
        COALESCE(GROUP_CONCAT(pi.image_url ORDER BY pi.sort_order ASC), '') as images,
        (SELECT COUNT(*) FROM reviews WHERE product_id = p.id) as reviewCount,
        (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE product_id = p.id) as averageRating
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT 20
    `);
    // Mocking some data that is not in the DB schema yet.
    // The originalPrice is now fetched from the database.
    return rows.map(p => {
      // Rename the 'quantity' column from the DB to 'stock' to avoid conflicts.
      const { quantity, ...rest } = p;
      return { ...rest, stock: quantity, images: p.images ? p.images.split(',') : [], rating: Number(p.averageRating), reviewCount: Number(p.reviewCount) };
    });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export default async function Home() {
  const products = await getProducts();

  // Dynamically create a unique list of categories from the fetched products
  const categories = products
    .map(p => ({ id: p.category_id, name: p.category }))
    .filter((value, index, self) => 
      value.name && self.findIndex(c => c.id === value.id) === index
    );

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="text-center md:text-right">
              <h1 className="text-3xl md:text-5xl font-bold mb-6">تسوق أحدث صيحات الموضة</h1>
              <p className="text-base md:text-xl mb-8">اكتشف مجموعتنا الحصرية من المنتجات عالية الجودة بأسعار منافسة</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <a href="#products" className="bg-yellow-400 text-purple-900 px-6 py-3 md:px-8 md:py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 text-center transition-colors">
                  تسوق الآن
                </a>
                <Link href="/sales" className="border-2 border-white hover:bg-white hover:text-purple-600 px-6 py-3 md:px-8 md:py-4 rounded-lg font-bold text-lg text-center transition-colors">
                  العروض الخاصة
                </Link>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white bg-opacity-20 rounded-3xl p-8">
                <div className="text-6xl mb-4">🛍️</div>
                <h3 className="text-2xl font-bold mb-2">خصومات تصل لـ 50%</h3>
                <p className="text-purple-200">على المنتجات المختارة</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">المنتجات المميزة</h2>
          </div>
          <ProductList products={products} categories={categories} />
        </div>
      </section>
    </>
  );
}
