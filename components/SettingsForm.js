'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { updateSettings } from '@/app/dashboard/settings/actions';
import { useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';

const initialState = {
  message: null,
  status: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:bg-gray-400">
      {pending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
    </button>
  );
}

export default function SettingsForm({ user }) {
  const [state, formAction] = useFormState(updateSettings, initialState);
  const prevStateRef = useRef(state);

  useEffect(() => {
    // Only show toast if the state has genuinely changed
    if (state !== prevStateRef.current) {
      if (state?.status === 'success') {
        toast.success(state.message);
      } else if (state?.status === 'error') {
        toast.error(state.message);
      }
      prevStateRef.current = state;
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-6 max-w-lg">
      <div>
        <label htmlFor="fullname" className="block text-sm font-medium text-gray-700">الاسم الكامل</label>
        <input type="text" name="fullname" id="fullname" defaultValue={user.fullname} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500" />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
        <input type="email" name="email" id="email" defaultValue={user.email} disabled className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed" />
      </div>
      <div>
        <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">رقم الجوال</label>
        <input type="text" name="mobile" id="mobile" defaultValue={user.mobile} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500" />
      </div>
      <SubmitButton />
    </form>
  );
}