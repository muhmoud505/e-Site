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
    images: [],
    category: productCategories[0] || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFiles = (files) => {
    const newFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (newFiles.length > 0) {
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, images: [...prev.images, ...newFiles] }));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleRemoveImage = (index) => {
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index]);

    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
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
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
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
        if (key !== 'images') data.append(key, formData[key]);
      });
      formData.images.forEach(imageFile => data.append('images', imageFile));
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
            <input type="text" name="name" id="name" value={formData.name} onChange={handleTextChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500" />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
            <textarea name="description" id="description" rows="4" value={formData.description} onChange={handleTextChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">السعر (ريال)</label>
              <input type="number" name="price" id="price" value={formData.price} onChange={handleTextChange} required min="0" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500" />
            </div>
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">الكمية في المخزون</label>
              <input type="number" name="stock" id="stock" value={formData.stock} onChange={handleTextChange} required min="0" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500" />
            </div>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">الفئة</label>
            <select name="category" id="category" value={formData.category} onChange={handleTextChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white">
              {productCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">صور المنتج</label>
            {imagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img src={preview} alt={`Product preview ${index + 1}`} className="h-24 w-24 object-cover rounded-md" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove image"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div
              className={`mt-4 flex justify-center rounded-lg border border-dashed px-6 py-10 ${isDragging ? 'border-purple-600 bg-purple-50' : 'border-gray-900/25'}`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
                </svg>
                <div className="mt-4 flex text-sm leading-6 text-gray-600">
                  <label htmlFor="images" className="relative cursor-pointer rounded-md bg-white font-semibold text-purple-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-purple-600 focus-within:ring-offset-2 hover:text-purple-500">
                    <span>ارفع ملفات</span>
                    <input id="images" name="images" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" multiple required={formData.images.length === 0} />
                  </label>
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