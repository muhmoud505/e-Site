import { getSession } from '@/lib/session';
import db from '@/lib/db';

export default async function OrdersPage() {
  const session = await getSession();

  // Fetch orders for the current user
  const [orders] = await db.query(
    `SELECT id, total_amount, status, DATE_FORMAT(order_date, '%Y-%m-%d') as formatted_date 
     FROM orders 
     WHERE user_id = ? 
     ORDER BY order_date DESC`,
    [session.userId]
  );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">طلباتي</h1>
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full w-full">
          <thead className="hidden md:table-header-group">
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">رقم الطلب</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">التاريخ</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">الحالة</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">الإجمالي</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 md:divide-y-0">
            {orders.length > 0 ? (
              orders.map((order) => (
              <tr key={order.id} className="block md:table-row border-b md:border-none">
                <td className="px-5 py-3 block md:table-cell text-sm" data-label="رقم الطلب">
                  <span className="md:hidden font-semibold">رقم الطلب: </span>#{order.id}
                </td>
                <td className="px-5 py-3 block md:table-cell text-sm" data-label="التاريخ">
                  <span className="md:hidden font-semibold">التاريخ: </span>{order.formatted_date}
                </td>
                <td className="px-5 py-3 block md:table-cell text-sm" data-label="الحالة">
                  <span className="md:hidden font-semibold">الحالة: </span>{order.status}
                </td>
                <td className="px-5 py-3 block md:table-cell text-sm" data-label="الإجمالي">
                  <span className="md:hidden font-semibold">الإجمالي: </span>{order.total_amount} ر.س
                </td>
              </tr>
            ))
            ) : (<tr><td colSpan="4" className="text-center py-10 text-gray-500">لا يوجد طلبات لعرضها.</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}