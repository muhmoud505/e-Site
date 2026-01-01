'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    gender: '',
    mobile: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (response.ok) {
      // On success, the session cookie is already set by the server.
      // We just need to refresh the page to update the UI (like the header).
      router.refresh();
      router.push('/dashboard'); // Redirect to the dashboard after successful registration.
    } else {
      // Handle potential validation errors from Zod
      if (data.errors) {
        const errorMessages = Object.values(data.errors).flat().join(' ');
        setError(errorMessages);
      } else {
        setError(data.message || 'Failed to register. Please try again.');
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="bg-white p-8 sm:p-10 rounded-lg shadow-md w-full max-w-md text-center">
        <h1 className="mb-6 text-2xl sm:text-3xl font-bold text-gray-800">Create an Account</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text" name="fullname" value={formData.fullname} onChange={handleChange} placeholder="Full Name" required
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <input
            type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="Password" required minLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition pl-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <select
            name="gender" value={formData.gender} onChange={handleChange} required
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white"
          >
            <option value="" disabled>Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <input
            type="tel" name="mobile" value={formData.mobile} onChange={handleChange} placeholder="Mobile Number" required
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <button type="submit" disabled={isLoading} className="w-full mt-2 px-4 py-3 border-none rounded-md bg-blue-600 text-white text-lg font-semibold cursor-pointer transition-colors hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
        {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}
        {success && <p className="mt-4 text-green-600 text-sm">{success}</p>}
        <p className="mt-6 text-sm text-gray-600">
          Already have an account? <Link href="/login" className="font-semibold text-blue-600 hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
}
