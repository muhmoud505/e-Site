"use client";

import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { ShoppingCart, Heart, User, LogIn } from 'lucide-react';
import LogoutButton from './LogoutButton';

const HeaderIcons = ({ session }) => {
  const { cart, wishlist } = useStore();

  return (
    <div className="flex items-center space-x-5 order-2 md:order-3">
      <Link href="/wishlist" className="relative cursor-pointer">
        <Heart className="w-7 h-7 text-gray-600 hover:text-red-500" />
        {wishlist.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{wishlist.length}</span>
        )}
      </Link>
      <Link href="/checkout" className="relative cursor-pointer">
        <ShoppingCart className="w-7 h-7 text-gray-600 hover:text-purple-600" />
        {cart.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{cart.reduce((acc, item) => acc + item.quantity, 0)}</span>
        )}
      </Link>

      {session ? (
        <>
          {session.role === 'admin' ? (
            <Link href="/admin" className="flex items-center gap-2">
              <User className="w-6 h-6 text-purple-600" />
              <span className="hidden sm:inline font-semibold text-purple-700">لوحة التحكم</span>
            </Link>
          ) : (
            <Link href="/dashboard" className="flex items-center gap-2">
              <User className="w-6 h-6 text-gray-600" />
              <span className="hidden sm:inline">حسابي</span>
            </Link>
          )}
          <LogoutButton />
        </>
      ) : (
        <Link href="/login" className="flex items-center gap-2">
          <LogIn className="w-6 h-6 text-gray-600" />
          <span className="hidden sm:inline">تسجيل الدخول</span>
        </Link>
      )}
    </div>
  );
};

export default HeaderIcons;