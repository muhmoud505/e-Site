"use client";

import { Heart, Star } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import Link from 'next/link';

const ProductCard = ({ product }) => {
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const isWishlisted = !!wishlist.find(item => item.id === product.id);

  return (
    <Link href={`/products/${product.id}`} className="block group">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden group-hover:shadow-xl transition-shadow">
        {/* Product Image */}
        <div className="relative h-64 bg-gray-200 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center text-6xl">
            🛍️
          </div>

          {/* Tags */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.isNew && (
              <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                جديد
              </span>
            )}
            {product.discount > 0 && (
              <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                -{product.discount}%
              </span>
            )}
          </div>

          {/* Wishlist Icon */}
          <button
            onClick={(e) => {
              e.preventDefault(); // Prevent link navigation
              toggleWishlist(product);
            }}
            className="absolute top-4 right-4 p-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
          >
            <Heart
              className={`w-5 h-5 ${
                isWishlisted
                  ? 'text-red-500 fill-current'
                  : 'text-gray-600'
              }`}
            />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-6">
          <h3 className="text-lg font-bold mb-2 text-gray-800">{product.name}</h3>

          {/* Rating */}
          <div className="flex items-center mb-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 mr-2">({product.reviews})</span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-2xl font-bold text-purple-600">{product.price} ريال</span>
              {product.originalPrice > product.price && (
                <span className="text-sm text-gray-500 line-through mr-2">
                  {product.originalPrice} ريال
                </span>
              )}
            </div>
            <span className={`text-sm ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
              {product.inStock ? 'متوفر' : 'غير متوفر'}
            </span>
          </div>

          {/* Action Buttons */}
          <button
            onClick={(e) => {
              e.preventDefault(); // Prevent link navigation
              addToCart(product);
            }}
            disabled={!product.inStock}
            className={`w-full py-3 rounded-lg font-semibold transition-colors ${product.inStock ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          >
            {product.inStock ? 'أضف للسلة' : 'غير متوفر'}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;