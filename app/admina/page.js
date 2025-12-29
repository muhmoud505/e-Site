import db from '@/lib/db';
import { Users, ShoppingBag, DollarSign, Package } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getStats() {
  const [users] = await db.query('SELECT COUNT(*) as count FROM users');
  const [products] = await db.query('SELECT COUNT(*) as count FROM products');
  const [orders] = await db.query('SELECT COUNT(*) as count FROM orders');
  const [revenue] = await db.query('SELECT SUM(total_amount) as total FROM orders WHERE status = ?', ['paid']);

  return {
    users: users[0].count,
    products: products[0].count,
    orders: orders[0].count,
    revenue: revenue[0].total || 0
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">نظرة عامة</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Users Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">إجمالي المستخدمين</p>
              <p className="text-2xl font-bold text-gray-900">{stats.users}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Products Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">إجمالي المنتجات</p>
              <p className="text-2xl font-bold text-gray-900">{stats.products}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">إجمالي الطلبات</p>
              <p className="text-2xl font-bold text-gray-900">{stats.orders}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <ShoppingBag className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Revenue Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">إجمالي المبيعات</p>
              <p className="text-2xl font-bold text-gray-900">{Number(stats.revenue).toLocaleString()} ريال</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}