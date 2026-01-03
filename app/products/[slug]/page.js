import db from "@/lib/db";
import { notFound } from "next/navigation";
import ProductClient from "@/components/ProductClient";

async function getProduct(slug) {
  try {
    // This query now matches the structure of your homepage's query
    const [rows] = await db.query(`
      SELECT 
        p.*, 
        p.stock > 0 as inStock,
        c.name as category,
        COALESCE(GROUP_CONCAT(pi.image_url ORDER BY pi.sort_order ASC), '') as images,
        (SELECT COUNT(*) FROM reviews WHERE product_id = p.id) as reviewCount,
        (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE product_id = p.id) as averageRating
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
    // Rename the 'quantity' column from the DB to 'stock' to avoid conflicts.
    const { quantity, ...rest } = product;
    // Mocking some data that is not in the DB schema yet.
    return { ...rest, stock: quantity, images: product.images.split(','), originalPrice: product.price * 1.25, rating: Number(product.averageRating), reviews: Number(product.reviewCount) };

  } catch (error) {
    console.error(`Failed to fetch product by slug ${slug}:`, error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const product = await getProduct(params.slug);

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
  const product = await getProduct(params.slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <ProductClient product={product} />
    </div>
  );
};

export default ProductPage;