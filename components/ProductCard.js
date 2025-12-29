import Link from 'next/link';
import Image from 'next/image';
import StarRating from './StarRating'; // Import the new component

const PLACEHOLDER_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

export default function ProductCard({ product }) {
  // Assuming you'll add a 'slug' field to your products for clean URLs
  const productUrl = `/products/${product.slug || product.id}`;

  return (
    <Link href={productUrl} className="group relative block border rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
        <Image
          src={product.image || PLACEHOLDER_IMAGE}
          alt={product.name}
          width={400}
          height={400}
          className="w-full h-full object-cover object-center group-hover:opacity-75 transition-opacity"
        />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-800 flex-grow">
          {product.name}
        </h3>
        {/* Interactive Star Rating */}
        <StarRating productId={product.id} initialRating={product.rating} reviewCount={product.reviewCount} />
        <div className="mt-2 flex items-baseline">
          {product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price) && (
            <p className="text-sm text-gray-500 line-through ml-2">{parseFloat(product.originalPrice).toFixed(2)} ر.س</p>
          )}
          <p className="text-xl font-bold text-purple-600">{parseFloat(product.price).toFixed(2)} ر.س</p>
        </div>
      </div>
    </Link>
  );
}