import { getSession } from '@/lib/session';

export default async function DashboardPage() {
  const session = await getSession();

  return (
    <div>
      <h1 className="text-2xl font-bold">لوحة التحكم</h1>
      <p className="mt-4">أهلاً بك في لوحة التحكم، {session.fullname}!</p>
    </div>
  );
}