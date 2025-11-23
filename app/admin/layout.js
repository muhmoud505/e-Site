import Link from 'next/link';
import { LayoutDashboard, ShoppingCart, Users, Package } from 'lucide-react';

export const metadata = {
  title: 'لوحة تحكم المسؤول',
  description: 'إدارة متجرك من هنا.',
};

export default function AdminLayout({ children }) {
  return (
    <div className="flex">
      <aside className="w-64 bg-gray-800 text-white p-4 min-h-screen">
        <h2 className="text-2xl font-bold mb-8 text-center">لوحة التحكم</h2>
        <nav>
          <ul>
            <li className="mb-4">
              <Link href="/admin" className="flex items-center p-2 rounded hover:bg-gray-700 transition-colors">
                <LayoutDashboard className="w-5 h-5 ml-3" />
                <span>نظرة عامة</span>
              </Link>
            </li>
            <li className="mb-4">
              <Link href="/admin/products" className="flex items-center p-2 rounded hover:bg-gray-700 transition-colors">
                <Package className="w-5 h-5 ml-3" />
                <span>المنتجات</span>
              </Link>
            </li>
            <li className="mb-4">
              <Link href="/admin/orders" className="flex items-center p-2 rounded hover:bg-gray-700 transition-colors">
                <ShoppingCart className="w-5 h-5 ml-3" />
                <span>الطلبات</span>
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="flex-grow p-8 bg-gray-100">
        {children}
      </main>
    </div>
  );
}