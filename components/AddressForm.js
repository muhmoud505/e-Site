'use client';

import { useFormStatus } from 'react-dom';
import { addAddress } from '@/app/dashboard/addresses/actions';
import { useEffect, useRef, useActionState } from 'react';
import { toast } from 'react-hot-toast';

const initialState = { message: null, status: null, errors: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:bg-gray-400">
      {pending ? 'جاري الإضافة...' : 'إضافة عنوان'}
    </button>
  );
}

export default function AddressForm() {
  const [state, formAction] = useActionState(addAddress, initialState);
  const formRef = useRef(null);

  useEffect(() => {
    if (state.status === 'success' && state.message) {
      toast.success(state.message);
      formRef.current?.reset(); // Reset form on success
    } else if (state.status === 'error' && state.message && !state.errors) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div>
        <label htmlFor="country" className="block text-sm font-medium text-gray-700">الدولة</label>
        <input type="text" name="country" id="country" autoComplete="country-name" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500" />
        {state?.errors?.country && <p className="mt-1 text-sm text-red-600">{state.errors.country[0]}</p>}
      </div>
      <div>
        <label htmlFor="city" className="block text-sm font-medium text-gray-700">المدينة</label>
        <input type="text" name="city" id="city" autoComplete="address-level2" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500" />
        {state?.errors?.city && <p className="mt-1 text-sm text-red-600">{state.errors.city[0]}</p>}
      </div>
      <div>
        <label htmlFor="street" className="block text-sm font-medium text-gray-700">الشارع</label>
        <input type="text" name="street" id="street" autoComplete="address-line1" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500" />
        {state?.errors?.street && <p className="mt-1 text-sm text-red-600">{state.errors.street[0]}</p>}
      </div>
      <div>
        <label htmlFor="building_number" className="block text-sm font-medium text-gray-700">رقم المبنى/الفيلا</label>
        <input type="text" name="building_number" id="building_number" autoComplete="address-line2" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500" />
        {state?.errors?.building_number && <p className="mt-1 text-sm text-red-600">{state.errors.building_number[0]}</p>}
      </div>
      {state?.status === 'error' && state.message && state.errors && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{state.message}</p>
        </div>
      )}
      <SubmitButton />
    </form>
  );
}