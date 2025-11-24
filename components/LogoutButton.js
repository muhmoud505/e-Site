'use client';

import { LogOut } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function LogoutButton() {
  const { logoutUser } = useStore();

  return (
    <button onClick={logoutUser} className="flex items-center gap-2">
      <LogOut className="w-6 h-6 text-gray-600" />
      <span className="hidden sm:inline">الخروج</span>
    </button>
  );
}