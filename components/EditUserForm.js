'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function EditUserForm({ user, isCurrentUser }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullname: user.fullname,
    email: user.email,
    role: user.role,
  });
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setMessage('تم تحديث المستخدم بنجاح!');
      // Redirect back to the users list after a short delay
      setTimeout(() => router.push('/admin/users'), 1500);
      router.refresh(); // Refresh the user list page data
    } else {
      let errorMessage = 'An unexpected error occurred.';
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || `Error: ${res.status}`;
      } catch (e) {
        errorMessage = `Error: ${res.status} ${res.statusText}`;
      }
      setMessage(`فشل تحديث المستخدم: ${errorMessage}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="fullname" className="block text-sm font-medium text-gray-700">الاسم الكامل</label>
        <input
          type="text"
          name="fullname"
          id="fullname"
          value={formData.fullname}
          onChange={handleInputChange}
          disabled={isCurrentUser}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">البريد الإلكتروني</label>
        <input
          type="email"
          name="email"
          id="email"
          value={formData.email}
          onChange={handleInputChange}
          disabled={isCurrentUser}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
        />
      </div>
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-700">الدور</label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleInputChange}
          disabled={isCurrentUser}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <button type="submit" disabled={isCurrentUser} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400 disabled:cursor-not-allowed">
        حفظ التغييرات
      </button>
      {message && <p className="mt-4 text-center text-sm text-gray-600">{message}</p>}
    </form>
  );
}
