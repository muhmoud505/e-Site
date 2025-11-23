"use client";

import { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Star, Plus, Minus } from 'lucide-react';

const ProductDetailsClient = ({ product }) => {
  const { addToCart } = useStore();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
      {/* Product Image */}
      <div className="bg-gray-200 rounded-lg flex items-center justify-center h-80 md:h-96">
        <div className="text-8xl">🛍️</div>
      </div>

      {/* Product Info */}
      <div className="flex flex-col justify-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>

        {/* Rating */}
        <div className="flex items-center mb-4">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.floor(product.rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-gray-600 mr-2">({product.reviews} مراجعة)</span>
        </div>

        <p className="text-gray-700 mb-6 text-lg">{product.description}</p>

        {/* Price */}
        <div className="flex items-baseline gap-3 mb-6">
          <span className="text-3xl md:text-4xl font-bold text-purple-600">{product.price} ريال</span>
          {product.originalPrice > product.price && (
            <span className="text-xl text-gray-500 line-through">
              {product.originalPrice} ريال
            </span>
          )}
        </div>

        {/* Quantity & Add to Cart */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="p-3"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-4 font-semibold">{quantity}</span>
            <button
              onClick={() => setQuantity(q => q + 1)}
              className="p-3"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
              product.inStock
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {product.inStock ? 'أضف للسلة' : 'غير متوفر'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsClient;