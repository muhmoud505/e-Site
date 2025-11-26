import Link from 'next/link';
import { getSession } from '@/lib/session';
import SearchForm from './SearchForm';
import HeaderIcons from './HeaderIcons';
import { ShoppingCart } from 'lucide-react';

// This tells Next.js to render this component dynamically because it reads cookies.
export const dynamic = 'force-dynamic';

const Header = async () => {
  let session = null;
  
  try {
    session = await getSession();
  } catch (error) {
    console.error('Error fetching session in Header:', error);
    // Continue without session - user will see login button
  }

  // Since useStore is a client hook, we can't use it directly here.

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
          <HeaderIcons session={session} />
        </div>
      </div>
    </header>
  );
};

export default Header;