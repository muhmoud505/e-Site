'use server';

import { redirect } from 'next/navigation';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import db from '@/lib/db';
import { createSession, deleteSession } from '@/lib/session';

const signupSchema = z.object({
  fullname: z.string().min(2, { message: 'الاسم مطلوب' }),
  email: z.string().email({ message: 'البريد الإلكتروني غير صالح' }),
  password: z.string().min(6, { message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }),
  mobile: z.string().min(10, { message: 'رقم الهاتف غير صالح' }),
  gender: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email({ message: 'البريد الإلكتروني غير صالح' }),
  password: z.string().min(1, { message: 'كلمة المرور مطلوبة' }),
});

export async function signup(prevState, formData) {
  const validatedFields = signupSchema.safeParse({
    fullname: formData.get('fullname'),
    email: formData.get('email'),
    password: formData.get('password'),
    mobile: formData.get('mobile'),
    gender: formData.get('gender') || 'male',
  });

  if (!validatedFields.success) {
    return { message: validatedFields.error.errors[0].message, status: 'error' };
  }

  const { fullname, email, password, mobile, gender } = validatedFields.data;

  try {
    // Check if user exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return { message: 'البريد الإلكتروني مستخدم بالفعل', status: 'error' };
    }

    // Insert new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (fullname, email, password, mobile, gender) VALUES (?, ?, ?, ?, ?)',
      [fullname, email, hashedPassword, mobile, gender]
    );

    // Create session immediately after signup
    await createSession(result.insertId);
  } catch (error) {
    console.error('Signup error:', error);
    return { message: 'حدث خطأ في النظام', status: 'error' };
  }

  redirect('/');
}

export async function login(prevState, formData) {
  const validatedFields = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return { message: validatedFields.error.errors[0].message, status: 'error' };
  }

  const { email, password } = validatedFields.data;

  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];

    const passwordMatch = user && await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return { message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة', status: 'error' };
    }

    await createSession(user.id);
  } catch (error) {
    console.error('Login error:', error);
    return { message: 'حدث خطأ في النظام', status: 'error' };
  }

  redirect('/');
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}