import { getSession } from '@/lib/session';
import db from '@/lib/db';
import SettingsForm from '@/components/SettingsForm';
import PasswordForm from '@/components/PasswordForm';

export default async function SettingsPage() {
  const session = await getSession();

  // Fetch current user data to pre-fill the form
  const [[user]] = await db.query(
    'SELECT fullname, email, mobile FROM users WHERE id = ?',
    [session.userId]
  );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">الإعدادات</h1>
      <div className="space-y-10">
        <div>
          <h2 className="text-xl font-semibold mb-4">المعلومات الشخصية</h2>
          <SettingsForm user={user} />
        </div>
        <div className="border-t border-gray-200 pt-10">
          <h2 className="text-xl font-semibold mb-4">تغيير كلمة المرور</h2>
          <PasswordForm />
        </div>
      </div>
    </div>
  );
}