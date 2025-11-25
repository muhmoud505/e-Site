import db from '@/lib/db';
import { notFound } from 'next/navigation';
import { EditUserForm } from '@/components/EditUserForm';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

async function getSession() {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(sessionCookie, secret);
    return payload;
  } catch (error) {
    return null;
  }
}

export default async function EditUserPage({ params }) {
  const { id } = params;

  // Fetch the specific user from the database
  const [rows] = await db.query(
    'SELECT id, fullname, email, role FROM users WHERE id = ?',
    [id]
  );

  const user = rows[0];
  if (!user) {
    notFound();
  }

  const session = await getSession();
  // Check if the user being edited is the currently logged-in user.
  const isCurrentUser = session?.id === Number(user.id);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">تعديل المستخدم: {user.fullname}</h1>
      <div className="bg-white p-8 rounded-lg shadow-md">
        <EditUserForm user={user} isCurrentUser={isCurrentUser} />
      </div>
    </div>
  );
}
