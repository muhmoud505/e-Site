'use client';

import { useFormStatus } from 'react-dom';
import { updatePassword } from '@/app/dashboard/settings/actions';
import { useEffect, useRef, useActionState, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

const initialState = { message: null, status: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:bg-gray-400">
      {pending ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
    </button>
  );
}

export default function PasswordForm() {
  const [state, formAction] = useActionState(updatePassword, initialState);
  const formRef = useRef(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (state?.status === 'success') {
      toast.success(state.message);
      formRef.current?.reset();
    } else if (state?.status === 'error') {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-6 max-w-lg">
      <div>
        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">كلمة المرور الحالية</label>
        <div className="relative">
          <input type={showCurrentPassword ? 'text' : 'password'} name="currentPassword" id="currentPassword" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 pl-10" />
          <button
            type="button"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-600"
            tabIndex={-1}
          >
            {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>
      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">كلمة المرور الجديدة</label>
        <div className="relative">
          <input type={showNewPassword ? 'text' : 'password'} name="newPassword" id="newPassword" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 pl-10" />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-600"
            tabIndex={-1}
          >
            {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">تأكيد كلمة المرور الجديدة</label>
        <div className="relative">
          <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" id="confirmPassword" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 pl-10" />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-600"
            tabIndex={-1}
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>
      <SubmitButton />
    </form>
  );
}