import { products } from '@/lib/data';
import { notFound } from 'next/navigation';
import ProductDetailsClient from '@/lib/ProductDetailsClient';

export async function generateMetadata({ params }) {
  const product = products.find(p => p.id === parseInt(params.id));

  if (!product) {
    return {
      title: 'المنتج غير موجود',
    };
  }

  return {
    title: product.name,
    description: product.description,
  };
}

const ProductPage = ({ params }) => {
  const { id } = params;
  const product = products.find(p => p.id === parseInt(id));

  // If no product is found for the ID, show a 404 page
  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* We pass the server-fetched data to a Client Component */}
      <ProductDetailsClient product={product} />
    </div>
  );
};

export default ProductPage;
