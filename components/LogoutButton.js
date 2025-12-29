'use client';

import { LogOut } from 'lucide-react';
import { logout } from '@/app/actions';

export default function LogoutButton() {
  const handleLogout = () => {
    localStorage.removeItem('user');
  };

  return (
    <form action={logout} onSubmit={handleLogout}>
      <button type="submit" className="flex items-center gap-2 w-full text-right">
        <LogOut className="w-5 h-5" />
        <span className="hidden md:inline">الخروج</span>
      </button>
    </form>
  );
}