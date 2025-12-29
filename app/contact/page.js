"use client";

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { handleContactForm } from './actions';

const initialState = { message: null, status: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="w-full bg-purple-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-purple-700 transition-colors disabled:bg-gray-400">
      {pending ? 'جاري الإرسال...' : 'إرسال الرسالة'}
    </button>
  );
}

export default function ContactPage() {
  const [state, formAction] = useFormState(handleContactForm, initialState);
  const formRef = useRef(null);

  useEffect(() => {
    if (state?.status === 'success') {
      toast.success(state.message);
      formRef.current?.reset(); // Reset form on success
    } else if (state?.status === 'error') {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-800">اتصل بنا</h1>
            <p className="text-gray-600 mt-2">
              نحن هنا للمساعدة. تواصل معنا لأي استفسار.
            </p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <form ref={formRef} action={formAction} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
                <input type="text" id="name" name="name" required className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                <input type="email" id="email" name="email" required className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500" />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">رسالتك</label>
                <textarea id="message" name="message" rows="4" required className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"></textarea>
              </div>
              <SubmitButton />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
