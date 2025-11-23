'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { addAddress } from '@/app/dashboard/addresses/actions';
import { useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';

const initialState = { message: null, status: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:bg-gray-400">
      {pending ? 'جاري الإضافة...' : 'إضافة عنوان'}
    </button>
  );
}

export default function AddressForm() {
  const [state, formAction] = useFormState(addAddress, initialState);
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
    <form ref={formRef} action={formAction} className="space-y-4">
      <div>
        <label htmlFor="country" className="block text-sm font-medium text-gray-700">الدولة</label>
        <input type="text" name="country" id="country" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500" />
      </div>
      <div>
        <label htmlFor="city" className="block text-sm font-medium text-gray-700">المدينة</label>
        <input type="text" name="city" id="city" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500" />
      </div>
      <div>
        <label htmlFor="street" className="block text-sm font-medium text-gray-700">الشارع</label>
        <input type="text" name="street" id="street" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500" />
      </div>
      <div>
        <label htmlFor="building_number" className="block text-sm font-medium text-gray-700">رقم المبنى/الفيلا</label>
        <input type="text" name="building_number" id="building_number" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500" />
      </div>
      <SubmitButton />
    </form>
  );
}