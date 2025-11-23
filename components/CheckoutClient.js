"use client";

import { useState } from "react";
import { useStore } from "@/context/StoreContext";
import { Plus, Minus, Trash2 } from "lucide-react";
import Link from "next/link";
import ConfirmationModal from "./ConfirmationModal";

const CheckoutClient = () => {
  const { cart, totalCartPrice, removeFromCart, updateCartQuantity, clearCart } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);

  if (cart.length === 0) {
    return (
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">سلة التسوق فارغة</h1>
        <p className="text-gray-600 mb-8">ليس لديك أي منتجات في سلتك.</p>
        <Link href="/" className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700">
          العودة للتسوق
        </Link>
      </div>
    );
  }

  const shippingCost = 25; // Example shipping cost
  const total = totalCartPrice + shippingCost;

  const handleClearCart = () => {
    clearCart();
    setIsModalOpen(false);
  };

  const handleRemoveItem = (productId) => {
    setItemToRemove(productId);
    setIsModalOpen(true);
  };

  return (
    <>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleClearCart}
        title="تأكيد تفريغ السلة"
        message="هل أنت متأكد أنك تريد إزالة جميع المنتجات من سلة التسوق؟"
      />
     

      <ConfirmationModal
        isOpen={isModalOpen && itemToRemove !== null}
        onClose={() => {setIsModalOpen(false); setItemToRemove(null);}}
        onConfirm={() => {removeFromCart(itemToRemove); setIsModalOpen(false); setItemToRemove(null);}}
        title="تأكيد إزالة المنتج"
        message="هل أنت متأكد أنك تريد إزالة هذا المنتج من سلة التسوق؟"
      />
      <div className="grid lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">سلة التسوق</h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-sm text-red-600 hover:text-red-800 font-semibold flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              تفريغ السلة
            </button>
          </div>
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-4 rounded-lg shadow-sm gap-4">
                <div className="flex items-center gap-4 w-full">
                  <div className="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center text-3xl">🛍️</div>
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-gray-600">{item.price} ريال</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 self-end sm:self-center">
                  {/* Quantity Controls */}
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      className="p-2"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-3 font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                      className="p-2"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Remove Button */}
                  <button onClick={() => handleRemoveItem(item.id)} className="text-gray-500 hover:text-red-600">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white p-6 rounded-lg shadow-sm h-fit">
          <h2 className="text-2xl font-bold mb-6">ملخص الطلب</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>المجموع الفرعي</span>
              <span>{totalCartPrice.toFixed(2)} ريال</span>
            </div>
            <div className="flex justify-between">
              <span>تكلفة الشحن</span>
              <span>{shippingCost.toFixed(2)} ريال</span>
            </div>
            <div className="border-t border-gray-200 my-4"></div>
            <div className="flex justify-between font-bold text-lg">
              <span>المجموع الإجمالي</span>
              <span>{total.toFixed(2)} ريال</span>
            </div>
          </div>
          <button className="w-full mt-6 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700">
            المتابعة للدفع
          </button>
        </div>
      </div>
    </>
  );
};

export default CheckoutClient;
