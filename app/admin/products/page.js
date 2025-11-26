import Link from 'next/link';
import Image from 'next/image';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getProducts() {
  // On the server, we need to use an absolute URL for fetch
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/products`, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error('Failed to fetch products');
  }
  return res.json();
}

async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">المنتجات</h1>
        <Link href="/admin/products/new" className="flex items-center gap-2 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
          <PlusCircle className="w-5 h-5" />
          <span>إضافة منتج جديد</span>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full min-w-[800px] text-right">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="p-4 font-semibold text-gray-600">صورة</th>
              <th className="p-4 font-semibold text-gray-600">الاسم</th>
              <th className="p-4 font-semibold text-gray-600">السعر</th>
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
                      src={product.image || `https://via.placeholder.com/150?text=${encodeURIComponent(product.name)}`}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </td>
                <td className="p-4 font-medium text-gray-800">{product.name}</td>
                <td className="p-4 text-gray-600">{parseFloat(product.price).toFixed(2)} ريال</td>
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
                    <Link href={`/admin/products/edit/${product.id}`} className="text-purple-600 hover:text-purple-800">
                      <Edit className="w-5 h-5" />
                    </Link>
                    {/* The delete button would trigger a modal for confirmation */}
                    <button className="text-red-600 hover:text-red-800">
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
            <p>لا توجد منتجات لعرضها. <Link href="/admin/products/new" className="text-purple-600 hover:underline">أضف منتجًا جديدًا</Link>.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductsPage;
