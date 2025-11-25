import db from '@/lib/db';
import Link from 'next/link';

export default async function AdminUsersPage() {
  // Fetch all users directly from the database
  const [users] = await db.query(
    `SELECT id, fullname, email, role, DATE_FORMAT(created_at, '%Y-%m-%d') as join_date 
     FROM users 
     ORDER BY created_at DESC`
  );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">إدارة المستخدمين</h1>
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full w-full">
          <thead className="hidden md:table-header-group">
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">الاسم الكامل</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">البريد الإلكتروني</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">الدور</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">تاريخ الانضمام</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 md:divide-y-0">
            {users.map((user) => (
              <tr key={user.id} className="block md:table-row border-b md:border-none">
                <td className="px-5 py-3 block md:table-cell text-sm" data-label="الاسم الكامل">
                  <span className="md:hidden font-semibold">الاسم: </span>{user.fullname}
                </td>
                <td className="px-5 py-3 block md:table-cell text-sm" data-label="البريد الإلكتروني">
                  <span className="md:hidden font-semibold">البريد: </span>{user.email}
                </td>
                <td className="px-5 py-3 block md:table-cell text-sm" data-label="الدور">
                  <span className="md:hidden font-semibold">الدور: </span>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-5 py-3 block md:table-cell text-sm" data-label="تاريخ الانضمام">
                  <span className="md:hidden font-semibold">تاريخ الانضمام: </span>{user.join_date}
                </td>
                <td className="px-5 py-3 block md:table-cell text-sm" data-label="الإجراءات">
                  <Link href={`/admin/users/${user.id}/edit`} className="text-purple-600 hover:text-purple-900">
                    تعديل
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
