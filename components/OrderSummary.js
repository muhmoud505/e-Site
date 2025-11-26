"use client";

import Image from 'next/image';

const OrderSummary = ({ cart, totalCartPrice }) => {
  
  return (
    <div className="lg:col-span-1 bg-white p-8 rounded-lg shadow-md h-fit">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
        ملخص الطلب
      </h2>
      <div className="space-y-4">
        {cart.map((item) => (
          <div key={item.id} className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="relative w-16 h-16 rounded-md mr-4 overflow-hidden">
                <Image
                  src={item.image || `https://via.placeholder.com/150?text=${encodeURIComponent(item.name)}`} alt={item.name} fill className="object-cover" />
              </div>
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-gray-600">الكمية: {item.quantity}</p>
              </div>
            </div>
            <p className="font-semibold">{item.price * item.quantity} ريال</p>
          </div>
        ))}
      </div>
      <div className="border-t mt-6 pt-6">
        <div className="flex justify-between font-bold text-xl">
          <span>الإجمالي</span>
          <span>{totalCartPrice} ريال</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;