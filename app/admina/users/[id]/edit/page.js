import db from '@/lib/db';
import { notFound } from 'next/navigation';
import { EditUserForm } from '@/components/EditUserForm';
import { getSession } from '@/lib/session';

export default async function EditUserPage({ params }) {
  const { id } = await params;

  // Fetch user data using raw SQL
  const [users] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
  const user = users[0];

  if (!user) {
    notFound();
  }

  const session = await getSession();
  // Check if the current logged-in admin is editing their own profile
  const isCurrentUser = session?.id === user.id;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">تعديل بيانات المستخدم</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <EditUserForm user={user} isCurrentUser={isCurrentUser} />
      </div>
    </div>
  );
}