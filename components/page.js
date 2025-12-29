import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const [users] = await db.query('SELECT id, fullname, email, role, created_at FROM users ORDER BY created_at DESC');

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">المستخدمون</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-right">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">الاسم</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">البريد الإلكتروني</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">الدور</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ التسجيل</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.fullname}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString('ar-EG')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}