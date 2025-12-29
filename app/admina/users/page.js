import db from '@/lib/db';
import Link from 'next/link';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminUsersTable from '@/components/AdminUsersTable';

export const dynamic = 'force-dynamic';

export default async function UsersPage({ searchParams }) {
  const { q, role, page } = (await searchParams) || {};
  const currentPage = Number(page) || 1;
  const limit = 10;
  const offset = (currentPage - 1) * limit;

  let whereClause = '';
  const params = [];
  const conditions = [];

  if (q) {
    conditions.push('(fullname LIKE ? OR email LIKE ?)');
    params.push(`%${q}%`, `%${q}%`);
  }

  if (role) {
    conditions.push('role = ?');
    params.push(role);
  }

  if (conditions.length > 0) {
    whereClause = ' WHERE ' + conditions.join(' AND ');
  }

  // Get total count for pagination
  const countQuery = `SELECT COUNT(*) as total FROM users${whereClause}`;
  const [countResult] = await db.query(countQuery, params);
  const totalItems = countResult[0].total;
  const totalPages = Math.ceil(totalItems / limit);

  // Get paginated users
  const query = `SELECT id, fullname, email, role, created_at FROM users${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
  const [users] = await db.query(query, [...params, limit, offset]);

  const createPageURL = (pageNumber) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (role) params.set('role', role);
    params.set('page', pageNumber.toString());
    return `/admina/users?${params.toString()}`;
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">المستخدمون</h1>

      <form className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="بحث بالاسم أو البريد الإلكتروني..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 pl-10"
          />
          <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600">
            <Search className="w-5 h-5" />
          </button>
        </div>
        <div className="flex gap-2">
          <select
            name="role"
            defaultValue={role || ''}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 bg-white"
          >
            <option value="">جميع الأدوار</option>
            <option value="user">مستخدم</option>
            <option value="admin">مسؤول</option>
          </select>
          <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            تصفية
          </button>
        </div>
      </form>

      <AdminUsersTable users={users} />

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6" dir="rtl">
          <Link
            href={createPageURL(currentPage - 1)}
            className={`p-2 rounded-md border flex items-center justify-center ${currentPage <= 1 ? 'pointer-events-none opacity-50 border-gray-200' : 'hover:bg-gray-50 border-gray-300'}`}
          >
            <ChevronRight className="w-5 h-5" />
          </Link>
          <span className="text-sm text-gray-700">
            صفحة {currentPage} من {totalPages}
          </span>
          <Link
            href={createPageURL(currentPage + 1)}
            className={`p-2 rounded-md border flex items-center justify-center ${currentPage >= totalPages ? 'pointer-events-none opacity-50 border-gray-200' : 'hover:bg-gray-50 border-gray-300'}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
        </div>
      )}
    </div>
  );
}