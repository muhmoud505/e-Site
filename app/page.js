import { categories } from '@/lib/data';
import ProductList from '@/components/ProductList';
import db from "@/lib/db";

// This forces the page to be rendered dynamically on the server
export const dynamic = 'force-dynamic';

async function getProducts() {
  try {
    const [products] = await db.query(
      `SELECT p.id, p.name, p.description, p.price, p.stock as inStock, p.image, c.name as category FROM products p LEFT JOIN categories c ON p.category_id = c.id`
    );
    // Mocking some data that is not in the DB schema yet
    return products.map(p => ({ ...p, originalPrice: p.price * 1.25, rating: 4.5, reviews: 95, isNew: false, discount: 20 }));
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
}

export default async function Home() {
  const products = await getProducts();

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-right">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">تسوق أحدث صيحات الموضة</h1>
              <p className="text-lg md:text-xl mb-8">اكتشف مجموعتنا الحصرية من المنتجات عالية الجودة بأسعار منافسة</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <a href="#products" className="bg-yellow-400 text-purple-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 text-center">
                  تسوق الآن
                </a>
                <button className="border-2 border-white hover:bg-white hover:text-purple-600 px-8 py-4 rounded-lg font-bold text-lg">العروض الخاصة</button>
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
      <section id="products" className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">المنتجات المميزة</h2>
          </div>
          <ProductList products={products} categories={categories} />
        </div>
      </section>
    </>
  );
}
