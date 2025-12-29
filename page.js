"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, X } from 'lucide-react';
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

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
  });
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error('Failed to fetch product data.');
        const product = await res.json();

        setFormData({
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          category: product.category,
        });
        setExistingImages(product.images || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      newImagePreviews.forEach(fileUrl => URL.revokeObjectURL(fileUrl));
    };
  }, [newImagePreviews]);

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFiles = (files) => {
    const newFilesArray = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (newFilesArray.length > 0) {
      const newPreviews = newFilesArray.map(file => URL.createObjectURL(file));
      setNewImages(prev => [...prev, ...newFilesArray]);
      setNewImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleRemoveExistingImage = (imageUrl) => {
    setExistingImages(prev => prev.filter(img => img !== imageUrl));
  };

  const handleRemoveNewImage = (index) => {
    URL.revokeObjectURL(newImagePreviews[index]);
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const slug = slugify(formData.name);
      const data = new FormData();

      // Append text data
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      data.append('slug', slug);

      // Append images to keep
      existingImages.forEach(imgUrl => data.append('existingImages[]', imgUrl));

      // Append new image files
      newImages.forEach(imageFile => data.append('images', imageFile));

      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        body: data,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'An unknown error occurred while updating the product.');
      }

      router.push('/admin/products');

    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">جاري تحميل بيانات المنتج...</div>;
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex items-center mb-8">
        <Link href="/admin/products" className="text-purple-600 hover:text-purple-800 transition-colors">
          <ArrowRight className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mr-4">تعديل المنتج</h1>
      </div>

      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-6 text-right">
          {/* Form fields for name, description, price, stock, category */}
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
              <option value="" disabled>اختر فئة</option>
              {productCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Image Management Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">صور المنتج</label>
            
            {/* Existing Images */}
            <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {existingImages.map((imgUrl) => (
                <div key={imgUrl} className="relative group">
                  <img src={imgUrl} alt="Existing product image" className="h-24 w-24 object-cover rounded-md" />
                  <button type="button" onClick={() => handleRemoveExistingImage(imgUrl)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Remove image"><X size={14} /></button>
                </div>
              ))}
              {/* New Image Previews */}
              {newImagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img src={preview} alt={`New preview ${index + 1}`} className="h-24 w-24 object-cover rounded-md" />
                  <button type="button" onClick={() => handleRemoveNewImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Remove image"><X size={14} /></button>
                </div>
              ))}
            </div>

            {/* File Uploader */}
            <div className="mt-4 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" /></svg>
                <div className="mt-4 flex text-sm leading-6 text-gray-600">
                  <label htmlFor="images" className="relative cursor-pointer rounded-md bg-white font-semibold text-purple-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-purple-600 focus-within:ring-offset-2 hover:text-purple-500">
                    <span>أضف ملفات</span>
                    <input id="images" name="images" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" multiple />
                  </label>
                  <p className="pr-1">أو اسحبها وأفلتها هنا</p>
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
              {isSubmitting ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}