import { notFound } from "next/navigation";
import Image from "next/image";
import { Star, CheckCircle, ShieldCheck } from "lucide-react";
import AddToCartButton from "@/components/AddToCartButton";
import db from "@/lib/db";

async function getProduct(id) {
  try {
    const [[product]] = await db.query(
      `SELECT p.id, p.name, p.description, p.price, p.stock as inStock, p.image FROM products p WHERE p.id = ?`,
      [id]
    );
    // Mocking some data that is not in the DB schema yet
    return product ? { ...product, originalPrice: product.price * 1.25, rating: 4.5, reviews: 95 } : null;
  } catch (error) {
    console.error(`Failed to fetch product ${id}:`, error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: `${product.name} | متجر الأناقة`,
    description: product.description,
  };
}

const ProductPage = async ({ params }) => {
  const { id } =await params;
  const product = await getProduct(id);

  // If no product is found for the ID, show a 404 page
  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Image Gallery */}
        <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
          <Image
            src={product.image || `https://via.placeholder.com/400?text=${encodeURIComponent(product.name)}`}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
          <div className="flex items-center mb-4">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-current' : ''}`} />
              ))}
            </div>
            <span className="text-gray-600 mr-2">({product.reviews} مراجعات)</span>
          </div>
          <p className="text-gray-700 text-lg mb-6">{product.description || "لا يوجد وصف متاح لهذا المنتج."}</p>
          
          <div className="mb-6">
            <span className="text-4xl font-bold text-purple-600">{product.price} ريال</span>
            {product.originalPrice > product.price && (
              <span className="text-xl text-gray-500 line-through mr-3">
                {product.originalPrice} ريال
              </span>
            )}
          </div>

          <div className="mb-8">
            <AddToCartButton product={product} />
          </div>

          <div className="space-y-3 text-gray-600">
            <div className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 ml-2" /><span>{product.inStock ? 'متوفر في المخزون' : 'غير متوفر حاليا'}</span></div>
            <div className="flex items-center"><ShieldCheck className="w-5 h-5 text-blue-500 ml-2" /><span>ضمان لمدة عامين</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;