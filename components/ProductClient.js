"use client";

import { useState } from "react";
import Image from 'next/image';
import { CheckCircle, ShieldCheck, Plus, Minus } from 'lucide-react';
import { useStore } from "@/context/StoreContext";
import StarRating from "./StarRating";
import ProductReviews from "./ProductReviews";

const PLACEHOLDER_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const ProductClient = ({ product }) => {
  const { addToCart } = useStore();
  const [selectedImage, setSelectedImage] = useState(product.images[0] || product.image);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(product.rating || 0);
  const [reviewCount, setReviewCount] = useState(product.reviews || 0);

  const handleReviewsUpdate = ({ count, rating }) => {
    setReviewCount(count);
    setRating(rating);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleQuantityChange = (amount) => {
    setQuantity(prev => {
      const newQuantity = prev + amount;
      if (newQuantity < 1) return 1;
      return newQuantity;
    });
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
        {/* Image Gallery */}
        <div>
          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
            <Image
              src={selectedImage || PLACEHOLDER_IMAGE}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              quality={100}
              priority
            />
          </div>
          <div className="grid grid-cols-5 gap-2">
            {product.images.filter(img => img).map((img, index) => (
              <div
                key={index}
                onClick={() => setSelectedImage(img)}
                className={`relative aspect-square rounded-md overflow-hidden cursor-pointer border-2 ${selectedImage === img ? 'border-purple-600' : 'border-transparent'}`}
              >
                <Image
                  src={img}
                  alt={`${product.name} - image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="20vw"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-2xl md:text-4xl font-bold mb-4">{product.name}</h1>
          <div className="mb-4">
            <StarRating initialRating={rating} reviewCount={reviewCount} />
          </div>
          <p className="text-gray-700 text-base md:text-lg mb-6">{product.description || "لا يوجد وصف متاح لهذا المنتج."}</p>
          
          <div className="mb-6">
            <span className="text-3xl md:text-4xl font-bold text-purple-600">{product.price} ريال</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xl text-gray-500 line-through mr-3">
                {product.originalPrice} ريال
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button onClick={() => handleQuantityChange(-1)} className="p-3 text-gray-600 hover:bg-gray-100 rounded-r-lg">
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 font-semibold">{quantity}</span>
              <button onClick={() => handleQuantityChange(1)} className="p-3 text-gray-600 hover:bg-gray-100 rounded-l-lg">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`flex-grow flex items-center justify-center gap-3 py-3 px-6 rounded-lg font-semibold transition-colors ${product.inStock ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            >
              <span>{product.inStock ? 'أضف للسلة' : 'غير متوفر'}</span>
            </button>
          </div>

          <div className="space-y-3 text-gray-600">
            <div className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 ml-2" />
              <span>{product.stock > 0 ? `متوفر (${product.stock} قطعة)` : 'غير متوفر حاليا'}</span></div>
            <div className="flex items-center"><ShieldCheck className="w-5 h-5 text-blue-500 ml-2" /><span>ضمان لمدة عامين</span></div>
          </div>
        </div>
      </div>
      {/* Review Section */}
      <ProductReviews product={product} onReviewsUpdate={handleReviewsUpdate} />
    </>
  );
};

export default ProductClient;