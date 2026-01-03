"use client";

import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { X } from 'lucide-react';

const PLACEHOLDER_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const OrderSummary = ({ cart, totalCartPrice }) => {
  const { removeFromCart } = useStore();

  // Helper to safely parse numbers from potentially dirty strings (e.g., "SAR 100", "10.00", "NaN")
  const safeParseFloat = (val) => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      // Remove any character that is NOT a digit or a dot
      const clean = val.replace(/[^0-9.]/g, '');
      return parseFloat(clean) || 0;
    }
    return 0;
  };

  const safeParseInt = (val) => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const clean = val.replace(/[^0-9]/g, '');
      return parseInt(clean, 10) || 0;
    }
    return 0;
  };

  // Calculate total items count safely
  const itemCount = cart.reduce((total, item) => total + safeParseInt(item.quantity), 0);

  // Ensure total price is a valid number, fallback to local calculation if store total is NaN
  // We use safeParseFloat on totalCartPrice to handle cases where it might be the string "NaN"
  const parsedStoreTotal = safeParseFloat(totalCartPrice);
  
  const safeTotalCartPrice = parsedStoreTotal > 0
    ? parsedStoreTotal.toFixed(2)
    : cart.reduce((acc, item) => acc + (safeParseFloat(item.price) * safeParseInt(item.quantity)), 0).toFixed(2);

  return (
    <div className="lg:col-span-1 bg-white p-4 md:p-8 rounded-lg shadow-md h-fit">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
        ملخص الطلب <span className="text-sm font-normal text-gray-500">({itemCount} منتجات)</span>
      </h2>
      <div className="space-y-4">
        {cart.map((item) => {
          const itemPrice = safeParseFloat(item.price);
          const itemQuantity = safeParseInt(item.quantity);
          // Try to get the image from item.image or the first image in item.images array
          const imageSrc = item.image || (item.images && item.images[0]) || PLACEHOLDER_IMAGE;
          return (
          <div key={item.id} className="flex justify-between items-start" data-testid={`cart-item-${item.id}`}>
            <div className="flex items-start flex-grow">
              <div className="relative w-16 h-16 rounded-md me-4 overflow-hidden flex-shrink-0 bg-gray-100">
                <Image
                  src={imageSrc}
                  alt={item.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="flex-grow">
                <p className="font-semibold leading-tight">{item.name}</p>
                <p className="text-sm text-gray-600">الكمية: {itemQuantity}</p>
                <p className="font-semibold text-sm mt-1">{(itemPrice * itemQuantity).toFixed(2)} ريال</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeFromCart(item.id)}
              className="text-gray-400 hover:text-red-500 transition-colors"
              aria-label={`Remove ${item.name} from cart`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )})}
        {cart.length === 0 && (
          <p className="text-gray-500 text-center">سلة التسوق فارغة.</p>
        )}
      </div>
      <div className="border-t mt-6 pt-6" data-testid="cart-total">
        <div className="flex justify-between font-bold text-xl">
          <span>الإجمالي</span>
          <span>{safeTotalCartPrice} ريال</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;