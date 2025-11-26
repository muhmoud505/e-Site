'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, ShoppingBag } from 'lucide-react';
import LogoutButton from './LogoutButton';

const navLinks = [
  { href: '/admin/users', label: 'المستخدمون', icon: Users },
  { href: '/admin/products', label: 'المنتجات', icon: ShoppingBag },
];

export default function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2">
      {navLinks.map((link) => {
        const isActive = pathname.startsWith(link.href);
        const Icon = link.icon;
        return (
          <Link key={link.href} href={link.href} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'}`}>
            <Icon className="w-5 h-5" />
            <span>{link.label}</span>
          </Link>
        );
      })}
      <div className="mt-auto pt-4 border-t border-gray-200">
        <LogoutButton />
      </div>
    </nav>
  );
}