"use client";

import { useState } from 'react';
import { Filter } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { products, categories } from '@/lib/data';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('الكل');

  const filteredProducts =
    selectedCategory === 'الكل'
      ? products
      : products.filter((product) => product.category === selectedCategory);

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
      <section id="products" className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">المنتجات المميزة</h2>
            {/* The filter button is not yet implemented. Commenting out for now. */}
            {/* <button className="flex items-center bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300">
              <Filter className="w-5 h-5 ml-2" />
              فلترة
            </button> */}
          </div>
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 text-lg">لا توجد منتجات في هذه الفئة حاليًا.</p>
          )}
        </div>
      </section>
    </>
  );
}
