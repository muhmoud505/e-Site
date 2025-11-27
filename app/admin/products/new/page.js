"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation'; 
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { categories } from '@/lib/data';

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\u0621-\u064A\u0660-\u0669\-]+/g, '') // Allow Arabic letters, numbers, and hyphens
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text

export default function NewProductPage() {
  const router = useRouter();
  const productCategories = categories.filter(c => c !== 'الكل');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    image: '',
    category: productCategories[0] || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      const file = files[0];
      if (file) {
        setFormData(prev => ({ ...prev, [name]: file }));
        setImagePreview(URL.createObjectURL(file));
      } else {
        setFormData(prev => ({ ...prev, [name]: null }));
        setImagePreview(null);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !formData.name) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const slug = slugify(formData.name);
      const payload = {
        ...formData
      };

      const data = new FormData();
      for (const key in payload) {
        data.append(key, payload[key]);
      }
      data.append('slug', slug);

      const res = await fetch('/api/products', {
        method: 'POST',
        body: data, // The browser will automatically set the Content-Type to multipart/form-data
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'فشل في إنشاء المنتج.');
      }

      // On success, redirect to the products list
      router.push('/admin/products');
      router.refresh(); // Refresh the page to show the new product

    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex items-center mb-8">
        <Link href="/admin/products" className="text-purple-600 hover:text-purple-800 transition-colors">
          <ArrowRight className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mr-4">إضافة منتج جديد</h1>
      </div>

      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-6 text-right">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">اسم المنتج</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500" />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
            <textarea name="description" id="description" rows="4" value={formData.description} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">السعر (ريال)</label>
              <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} required min="0" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500" />
            </div>
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">الكمية في المخزون</label>
              <input type="number" name="stock" id="stock" value={formData.stock} onChange={handleChange} required min="0" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500" />
            </div>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">الفئة</label>
            <select name="category" id="category" value={formData.category} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white">
              {productCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">صورة المنتج</label>
            <div
              className={`mt-2 flex justify-center rounded-lg border border-dashed px-6 py-10 ${isDragging ? 'border-purple-600 bg-purple-50' : 'border-gray-900/25'}`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="text-center">
                {imagePreview ? (
                  <div>
                    <img src={imagePreview} alt="Product preview" className="mx-auto h-40 w-40 object-cover rounded-md" />
                    <button type="button" onClick={() => {
                      setImagePreview(null);
                      setFormData(prev => ({ ...prev, image: null }));
                      document.getElementById('image').value = '';
                    }} className="mt-4 text-sm font-semibold text-red-600 hover:text-red-500">
                      إزالة الصورة
                    </button>
                  </div>
                ) : (
                  <svg className="mx-auto h-12 w-12 text-gray-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
                  </svg>
                )}
                <div className="mt-4 flex text-sm leading-6 text-gray-600">
                  <label htmlFor="image" className="relative cursor-pointer rounded-md bg-white font-semibold text-purple-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-purple-600 focus-within:ring-offset-2 hover:text-purple-500"><span>ارفع ملفًا</span><input id="image" name="image" type="file" className="sr-only" onChange={handleChange} accept="image/*" required={!imagePreview} /></label>
                  <p className="pr-1">أو اسحبه وأفلته هنا</p>
                </div>
                <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end gap-4 pt-4">
            <Link href="/admin/products" className="py-2 px-6 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              إلغاء
            </Link>
            <button type="submit" disabled={isSubmitting} className="py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400 disabled:cursor-not-allowed">
              {isSubmitting ? 'جاري الحفظ...' : 'حفظ المنتج'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}