"use client";

import { useState } from "react";

const CheckoutForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    cardNumber: "",
    expiryDate: "",
    cvc: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would send this data to your backend
    // and interact with a payment provider like Stripe.
    console.log("Processing payment for:", formData);
    alert("Payment submitted! Check the console for the form data.");
    // Here you would typically redirect to a success page or show a confirmation message.
  };

  return (
    <div className="lg:col-span-2 bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        إتمام عملية الدفع
      </h1>

      <form onSubmit={handleSubmit}>
        {/* Shipping Information */}
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">
          معلومات الشحن
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <input
            type="text"
            name="name"
            placeholder="الاسم الكامل"
            onChange={handleChange}
            value={formData.name}
            className="p-2 border rounded-md"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="البريد الإلكتروني"
            onChange={handleChange}
            value={formData.email}
            className="p-2 border rounded-md"
            required
          />
          <input
            type="text"
            name="address"
            placeholder="العنوان"
            onChange={handleChange}
            value={formData.address}
            className="p-2 border rounded-md md:col-span-2"
            required
          />
        </div>

        {/* Payment Details */}
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">
          معلومات الدفع
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <input
            type="text"
            name="cardNumber"
            placeholder="رقم البطاقة"
            onChange={handleChange}
            value={formData.cardNumber}
            className="p-2 border rounded-md md:col-span-2"
            required
          />
          <input
            type="text"
            name="expiryDate"
            placeholder="تاريخ الانتهاء (MM/YY)"
            onChange={handleChange}
            value={formData.expiryDate}
            className="p-2 border rounded-md"
            required
          />
          <input
            type="text"
            name="cvc"
            placeholder="CVC"
            onChange={handleChange}
            value={formData.cvc}
            className="p-2 border rounded-md"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-purple-600 text-white p-3 rounded-md font-bold hover:bg-purple-700 transition-colors"
        >
          ادفع الآن
        </button>
      </form>
    </div>
  );
};

export default CheckoutForm;