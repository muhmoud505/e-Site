"use client";

import { useState } from 'react';
import ProductCard from '@/components/ProductCard';

const ProductList = ({ products, categories }) => {
  const [selectedCategory, setSelectedCategory] = useState('الكل');

  const filteredProducts =
    selectedCategory === 'الكل'
      ? products
      : products.filter((product) => product.category === selectedCategory);

  return (
    <>
      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">تسوق حسب الفئة</h2>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full font-semibold transition-colors ${selectedCategory === category ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-purple-100'}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
};

export default ProductList;