"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/context/StoreContext";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import CheckoutForm from "./CheckoutForm";
import OrderSummary from "./OrderSummary";
import { getAddresses } from "@/app/dashboard/addresses/actions";

export default function CheckoutClient({ addresses: initialAddresses }) {
  const { cart, totalCartPrice, isStoreLoading } = useStore();
  const [addresses, setAddresses] = useState(initialAddresses);

  useEffect(() => {
    if (initialAddresses === undefined) {
      getAddresses()
        .then((data) => setAddresses(data))
        .catch((err) => console.error("Failed to fetch addresses", err));
    }
  }, [initialAddresses]);

  if (isStoreLoading) {
    return <div className="text-center py-16">جاري تحميل السلة...</div>;
  }

  if (cart.length === 0) {
    return (
      <div className="text-center py-16 bg-white p-8 rounded-lg shadow-md">
        <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h1 className="text-3xl font-bold mb-4">سلة التسوق فارغة</h1>
        <p className="text-gray-600 mb-8">
          لا يوجد منتجات في سلتك. ابدأ التسوق الآن!
        </p>
        <Link
          href="/"
          className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700"
        >
          العودة إلى الصفحة الرئيسية
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      <CheckoutForm addresses={addresses} />
      <OrderSummary cart={cart} totalCartPrice={totalCartPrice} />
    </div>
  );
}