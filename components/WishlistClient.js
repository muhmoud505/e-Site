"use client";

import { useStore } from "@/context/StoreContext";
import { Heart } from "lucide-react";
import Link from "next/link";
import ProductCard from "./ProductCard";

const WishlistClient = () => {
  const { wishlist } = useStore();

  if (wishlist.length === 0) {
    return (
      <div className="text-center py-16">
        <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h1 className="text-3xl font-bold mb-4">قائمة الرغبات فارغة</h1>
        <p className="text-gray-600 mb-8">
          أضف المنتجات التي تعجبك لتبقى على اطلاع عليها.
        </p>
        <Link
          href="/"
          className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700"
        >
          اكتشف المنتجات
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">قائمة الرغبات ({wishlist.length})</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
        {wishlist.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default WishlistClient;
