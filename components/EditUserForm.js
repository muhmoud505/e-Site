'use client';

import { useFormStatus } from 'react-dom';
import { useEffect, useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { updateUserAction, deleteUserAction } from '@/app/admina/users/[id]/edit/actions';
import ConfirmationModal from './ConfirmationModal';
import { Trash2 } from 'lucide-react';

const initialState = { message: null, status: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400 disabled:cursor-not-allowed">
      {pending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
    </button>
  );
}

export function EditUserForm({ user }) {
  const router = useRouter();
  const updateUserWithId = updateUserAction.bind(null, user.id);
  const [state, formAction] = useActionState(updateUserWithId, initialState);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (state?.status === 'success') {
      toast.success(state.message);
      // Redirect back to the users list after a short delay
      setTimeout(() => router.push('/admina/users'), 1500);
    } else if (state?.status === 'error') {
      toast.error(state.message);
    }
  }, [state, router]);

  const handleDelete = async () => {
    const result = await deleteUserAction(user.id);
    if (result?.status === 'success') {
      toast.success(result.message);
      router.push('/admina/users');
    } else {
      toast.error(result?.message || 'حدث خطأ أثناء حذف المستخدم');
    }
    setIsDeleteModalOpen(false);
  };

  return (
    <>
    <form action={formAction} className="space-y-6">
      <div>
        <label htmlFor="fullname" className="block text-sm font-medium text-gray-700">الاسم الكامل</label>
        <input
          type="text"
          name="fullname"
          id="fullname"
          defaultValue={user.fullname}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
        <input
          type="email"
          name="email"
          id="email"
          defaultValue={user.email}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
        />
      </div>
      <div>
        <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">رقم الجوال</label>
        <input
          type="text"
          name="mobile"
          id="mobile"
          defaultValue={user.mobile}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">كلمة المرور (اختياري)</label>
        <input
          type="password"
          name="password"
          id="password"
          placeholder="اتركه فارغاً للاحتفاظ بكلمة المرور الحالية"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
        />
      </div>
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">الدور</label>
        <select
          id="role"
          name="role"
          defaultValue={user.role}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <SubmitButton />
      <button
        type="button"
        onClick={() => setIsDeleteModalOpen(true)}
        className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        <Trash2 className="w-4 h-4" />
        حذف المستخدم
      </button>
    </form>
    <ConfirmationModal
      isOpen={isDeleteModalOpen}
      onClose={() => setIsDeleteModalOpen(false)}
      onConfirm={handleDelete}
      title="حذف المستخدم"
      message="هل أنت متأكد أنك تريد حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء."
    />
    </>
  );
}
