import WishlistClient from '@/components/WishlistClient';

export const metadata = {
  title: 'قائمة الرغبات',
  description: 'المنتجات التي أضفتها إلى قائمة رغباتك.',
};

export default function WishlistPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <WishlistClient />
    </div>
  );
}