"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';
import ConfirmationModal from '@/components/ConfirmationModal';

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    await fetch(`/api/products/${productToDelete.id}`, { method: 'DELETE' });
    setIsModalOpen(false);
    setProductToDelete(null);
    router.refresh(); // Re-fetches data on the server and re-renders
    // Optimistic UI update
    setProducts(products.filter(p => p.id !== productToDelete.id));
  };

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">المنتجات</h1>
        <Link href="/admina/products/new" className="flex items-center gap-2 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
          <PlusCircle className="w-5 h-5" />
          <span>إضافة منتج جديد</span>
        </Link>
      </div>

      {isLoading && <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin" /></div>}
      {error && <div className="text-center text-red-500 p-8">{error}</div>}

      {!isLoading && !error && (
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full min-w-[800px] text-right">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="p-4 font-semibold text-gray-600">صورة</th>
              <th className="p-4 font-semibold text-gray-600">الاسم</th>
              <th className="p-4 font-semibold text-gray-600">السعر / الخصم</th>
              <th className="p-4 font-semibold text-gray-600">الفئة</th>
              <th className="p-4 font-semibold text-gray-600">المخزون</th>
              <th className="p-4 font-semibold text-gray-600">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="p-4">
                  <div className="relative h-16 w-16 rounded-md overflow-hidden">
                    <Image
                      src={product.image || '/placeholder.png'}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </td>
                <td className="p-4 font-medium text-gray-800">{product.name}</td>
                <td className="p-4 text-gray-600">
                  {product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price) ? (
                    <div>
                      <span className="font-bold text-red-600">{parseFloat(product.price).toFixed(2)} ريال</span>
                      <span className="ml-2 text-sm text-gray-400 line-through">
                        {parseFloat(product.originalPrice).toFixed(2)} ريال
                      </span>
                    </div>
                  ) : (
                    <span>{parseFloat(product.price).toFixed(2)} ريال</span>
                  )}
                </td>
                <td className="p-4 text-gray-600">{product.category}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    product.stock > 0
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.stock > 0 ? 'متوفر' : 'غير متوفر'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-4">
                    <Link href={`/admina/products/edit/${product.id}`} className="text-purple-600 hover:text-purple-800">
                      <Edit className="w-5 h-5" />
                    </Link>
                    {/* This button now triggers the confirmation modal */}
                    <button onClick={() => handleDeleteClick(product)} className="text-red-600 hover:text-red-800">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products && products.length === 0 && (
          <div className="text-center p-8 text-gray-500">
            <p>لا توجد منتجات لعرضها. <Link href="/admina/products/new" className="text-purple-600 hover:underline">أضف منتجًا جديدًا</Link>.</p>
          </div>
        )}
      </div>
      )}

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="تأكيد الحذف"
        message={`هل أنت متأكد أنك تريد حذف المنتج "${productToDelete?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
      />
    </div>
  );
}

export default ProductsPage;
