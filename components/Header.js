import { ShoppingCart, Heart, User, LogIn } from 'lucide-react';
import Link from 'next/link';
import { getSession } from '@/lib/session';
import LogoutButton from './LogoutButton';
import SearchForm from './SearchForm';

const Header = async () => {
  const session = await getSession();

  // Since useStore is a client hook, we can't use it directly here.
  // We'll wrap the parts that need it in a client component.
  // For now, let's focus on the login/logout state.

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center gap-4 flex-wrap">
          <Link href="/" className="flex items-center">
            <ShoppingCart className="w-8 h-8 text-purple-600 ml-3" />
            <div>
              <h1 className="text-2xl font-bold text-purple-600">متجر الأناقة</h1>
              <p className="text-gray-600 hidden sm:block">تسوق بأناقة وثقة</p>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 order-3 md:order-2 w-full md:w-auto min-w-[200px] max-w-lg mx-auto">
            <SearchForm />
          </div>

          {/* Store Icons */}
          <div className="flex items-center space-x-5 order-2 md:order-3">
            {/* These can be wrapped in a client component to get live cart/wishlist counts */}
            <Link href="/wishlist" className="relative cursor-pointer"><Heart className="w-7 h-7 text-gray-600 hover:text-red-500" /></Link>
            <Link href="/checkout" className="relative cursor-pointer"><ShoppingCart className="w-7 h-7 text-gray-600 hover:text-purple-600" /></Link>

            {session ? (
              <>
                <Link href="/dashboard" className="flex items-center gap-2">
                  <User className="w-6 h-6 text-gray-600" />
                  <span className="hidden sm:inline">حسابي</span>
                </Link>
                <LogoutButton />
              </>
            ) : (
              <Link href="/login" className="flex items-center gap-2">
                <LogIn className="w-6 h-6 text-gray-600" />
                <span className="hidden sm:inline">تسجيل الدخول</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;