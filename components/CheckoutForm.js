"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import Link from "next/link";
import { toast } from "react-hot-toast";

const CheckoutForm = ({ addresses }) => {
  console.log(addresses);
  
  const { cart, clearCart } = useStore();
  const router = useRouter();
  const [shippingDetails, setShippingDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [selectedAddressId, setSelectedAddressId] = useState(null);

  useEffect(() => {
    if (addresses && addresses.length > 0) {
      const defaultAddress = addresses.find((addr) => addr.is_default) || addresses[0];
      setSelectedAddressId(defaultAddress.id);
    }
  }, [addresses]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingDetails((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleProceedToPayment = async (e) => {
    e.preventDefault();

    if (!addresses || addresses.length === 0) {
      toast.error("يرجى إضافة عنوان للشحن للمتابعة");
      return;
    }

    // Ensure an address is selected if available (fallback logic)
    let currentAddressId = selectedAddressId;
    if (!currentAddressId && addresses && addresses.length > 0) {
      const defaultAddress = addresses.find((addr) => addr.is_default) || addresses[0];
      currentAddressId = defaultAddress.id;
      setSelectedAddressId(currentAddressId);
    }

    if (!currentAddressId) { 
      toast.error("يرجى اختيار عنوان للشحن");
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const selectedAddress = addresses.find(a => a.id === currentAddressId);
      const fullShippingDetails = { ...shippingDetails, address: selectedAddress };

      // 1. Call your backend to create the order and get the payment token
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart, shippingDetails: fullShippingDetails }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create order.');
      }

      // 2. If successful, redirect to Paymob's payment page
      if (data.paymentToken) {
        const iframeId = process.env.NEXT_PUBLIC_PAYMOB_IFRAME_ID;
        // The cart should be cleared only after a successful payment is confirmed.
        // This is typically handled on a success/thank-you page or via a webhook.
        // clearCart();
        window.location.href = `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${data.paymentToken}`;
      } else {
        throw new Error('Payment token was not received.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="lg:col-span-2 bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        إتمام عملية الدفع
      </h1>

      <form onSubmit={handleProceedToPayment}>
        {/* Shipping Information */}
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">
          بيانات التواصل
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <input
            type="text"
            name="firstName"
            placeholder="الاسم الأول"
            onChange={handleInputChange}
            value={shippingDetails.firstName}
            className="p-2 border rounded-md"
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder="الاسم الأخير"
            onChange={handleInputChange}
            value={shippingDetails.lastName}
            className="p-2 border rounded-md"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="البريد الإلكتروني"
            onChange={handleInputChange}
            value={shippingDetails.email}
            className="p-2 border rounded-md md:col-span-2"
            required
          />
          <input
            type="tel"
            name="phone"
            placeholder="رقم الهاتف"
            onChange={handleInputChange}
            value={shippingDetails.phone}
            className="p-2 border rounded-md md:col-span-2"
            required
          />
        </div>

        {addresses && addresses.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">عنوان التوصيل</h2>
            <div className="space-y-3">
              {addresses.map((addr) => (
                <label key={addr.id} className={`block p-4 border rounded-lg cursor-pointer transition-colors ${selectedAddressId === addr.id ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="selectedAddress"
                      value={addr.id}
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                    />
                    <div className="mr-3">
                      <span className="block font-medium text-gray-900">{addr.city}, {addr.country}</span>
                      <span className="block text-sm text-gray-500">{addr.street}, {addr.building_number}</span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {(!addresses || addresses.length === 0) && (
          <div className="mb-4 p-4 bg-yellow-50 border-r-4 border-yellow-400 text-yellow-700">
            <p>
              لا يوجد عنوان مسجل. يرجى{' '}
              <Link href="/dashboard/addresses" className="underline font-bold">
                إضافة عنوان
              </Link>{' '}
              للمتابعة.
            </p>
          </div>
        )}

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-purple-600 text-white p-3 rounded-md font-bold hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'جاري التوجيه للدفع...' : 'المتابعة للدفع'}
        </button>
      </form>
    </div>
  );
};

export default CheckoutForm;