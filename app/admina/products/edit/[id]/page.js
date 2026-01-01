"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation'; 
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
import { categories } from '@/lib/data';

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0621-\u064A\u0660-\u0669\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const productCategories = categories.filter(c => c !== 'الكل');

  const [formData, setFormData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          const res = await fetch(`/api/products/${id}`);
          if (!res.ok) throw new Error('Failed to fetch product data.');
          const product = await res.json();
          setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            originalPrice: product.originalPrice || '', // Add originalPrice
            stock: product.stock,
            image: null, // We don't pre-fill the file input
            category: product.category_name,
          });
          setImagePreview(product.image); // Set existing image as preview
        } catch (err) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      const file = files[0];
      if (file) {
        setFormData(prev => ({ ...prev, [name]: file }));
        setImagePreview(URL.createObjectURL(file));
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

  const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
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
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) { // Only append if value is not null
          // Don't append the image if it's just the preview URL string
          if (key === 'image' && typeof formData[key] === 'string') return;
          data.append(key, formData[key] ?? '');
        }
      });
      data.append('slug', slug);

      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        body: data,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل في تحديث المنتج.');
      }

      router.refresh();
      router.push('/admina/products'); // Push after refresh

    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-8">{error}</div>;
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex items-center mb-8">
        <Link href="/admina/products" className="text-purple-600 hover:text-purple-800 transition-colors">
          <ArrowRight className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mr-4">تعديل المنتج</h1>
      </div>

      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
        {formData && (
          <form onSubmit={handleSubmit} className="space-y-6 text-right">
            {/* Form fields are identical to new/page.js, just with value={formData.field} */}
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">اسم المنتج</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500" />
            </div>
            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
              <textarea name="description" id="description" rows="4" value={formData.description} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"></textarea>
            </div>
            {/* Price & Stock */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700 mb-1">السعر الأصلي (ريال)</label>
                <input type="number" name="originalPrice" id="originalPrice" value={formData.originalPrice} onChange={handleChange} placeholder="اختياري لوضع خصم" min="0" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500" />
              </div>
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">السعر (ريال)</label>
                <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} required min="0" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500" />
              </div>
              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">الكمية في المخزون</label>
                <input type="number" name="stock" id="stock" value={formData.stock} onChange={handleChange} required min="0" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500" />
              </div>
            </div>
            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">الفئة</label>
              <select name="category" id="category" value={formData.category} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white">
                {productCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">صورة المنتج</label>
              <div className={`mt-2 flex justify-center rounded-lg border border-dashed px-6 py-10 ${isDragging ? 'border-purple-600 bg-purple-50' : 'border-gray-900/25'}`} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}>
                <div className="text-center">
                  {imagePreview ? <img src={imagePreview} alt="Product preview" className="mx-auto h-40 w-40 object-cover rounded-md" /> : <svg className="mx-auto h-12 w-12 text-gray-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" /></svg>}
                  <div className="mt-4 flex text-sm leading-6 text-gray-600"><label htmlFor="image" className="relative cursor-pointer rounded-md bg-white font-semibold text-purple-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-purple-600 focus-within:ring-offset-2 hover:text-purple-500"><span>ارفع ملفًا</span><input id="image" name="image" type="file" className="sr-only" onChange={handleChange} accept="image/*" /></label><p className="pr-1">أو اسحبه وأفلته هنا</p></div>
                  <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {/* Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <Link href="/admina/products" className="py-2 px-6 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">إلغاء</Link>
              <button type="submit" disabled={isSubmitting} className="py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400 disabled:cursor-not-allowed">{isSubmitting ? 'جاري الحفظ...' : 'حفظ التغييرات'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}