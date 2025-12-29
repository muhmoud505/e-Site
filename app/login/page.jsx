'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { login } from '../actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="w-full mt-2 px-4 py-3 border-none rounded-md bg-blue-600 text-white text-lg font-semibold cursor-pointer transition-colors hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
      {pending ? 'Logging in...' : 'Login'}
    </button>
  );
}

export default function LoginPage() {
  const [state, action] = useFormState(login, null);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="bg-white p-8 sm:p-10 rounded-lg shadow-md w-full max-w-md text-center">
        <h1 className="mb-6 text-2xl sm:text-3xl font-bold text-gray-800">Login</h1>
        <form action={action} className="flex flex-col gap-4">
          <input
            type="email" name="email" placeholder="Email" required
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <input
            type="password" name="password" placeholder="Password" required
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <SubmitButton />
        </form>
        {state?.message && <p className="mt-4 text-red-600 text-sm">{state.message}</p>}
        <p className="mt-6 text-sm text-gray-600">
          Don't have an account? <Link href="/register" className="font-semibold text-blue-600 hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
}