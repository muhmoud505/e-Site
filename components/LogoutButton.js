'use client';

import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/logout', {
      method: 'POST',
    });
    router.push('/');
    router.refresh(); // This is important to re-fetch server components
  };

  return (
    <button onClick={handleLogout} className="flex items-center gap-2">
      <LogOut className="w-6 h-6 text-gray-600" />
      <span className="hidden sm:inline">الخروج</span>
    </button>
  );
}