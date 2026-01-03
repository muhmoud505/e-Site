'use client';

import { useState } from 'react';
import ProductCard from './ProductCard';

export default function ProductList({ products, categories = [] }) {
  const [filter, setFilter] = useState('all');

  const filteredProducts = products.filter(product => 
    filter === 'all' || product.category === filter
  );

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-full font-semibold transition-colors ${filter === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>الكل</button>
        {categories.map(category => (
          <button key={category.id} onClick={() => setFilter(category.name)} className={`px-4 py-2 rounded-full font-semibold transition-colors ${filter === category.name ? 'bg-purple-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>
            {category.name}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}