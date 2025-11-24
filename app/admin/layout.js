import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import AdminSidebarNav from '@/components/AdminSidebarNav';

export default async function AdminLayout({ children }) {
  const session = await getSession();

  // Protect the entire admin section
  if (!session || session.role !== 'admin') {
    // Redirect non-admins to the home page
    redirect('/');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <h2 className="text-xl font-bold mb-4">لوحة تحكم المسؤول</h2>
          <AdminSidebarNav />
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}