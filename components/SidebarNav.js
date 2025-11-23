'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Settings, MapPin, LogOut } from 'lucide-react';
import LogoutButton from './LogoutButton';

const navLinks = [
  { href: '/dashboard', label: 'نظرة عامة', icon: LayoutDashboard },
  { href: '/dashboard/orders', label: 'الطلبات', icon: ShoppingBag },
  { href: '/dashboard/addresses', label: 'العناوين', icon: MapPin },
  { href: '/dashboard/settings', label: 'الإعدادات', icon: Settings },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-row md:flex-col gap-2 justify-between h-full">
      {navLinks.map((link) => {
        const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
        const Icon = link.icon;
        return (
          <Link key={link.href} href={link.href} className={`flex flex-1 md:flex-none justify-center md:justify-start items-center gap-3 p-3 rounded-lg transition-colors ${isActive ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'}`}>
            <Icon className="w-5 h-5" />
            <span className="hidden md:inline">{link.label}</span>
          </Link>
        );
      })}
      <div className="mt-auto pt-4 border-t border-gray-200 hidden md:block">
        <LogoutButton />
      </div>
    </nav>
  );
}
