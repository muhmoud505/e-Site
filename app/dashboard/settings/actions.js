'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import db from '@/lib/db';
import { getSession } from '@/lib/session';
import bcrypt from 'bcrypt';


const settingsSchema = z.object({
  fullname: z.string().min(3, 'الاسم الكامل مطلوب'),
  mobile: z.string().min(5, 'رقم الجوال مطلوب'),
});

export async function updateSettings(prevState, formData) {
  const session = await getSession();
  if (!session) {
    return { message: 'غير مصرح به', status: 'error' };
  }

  const validatedFields = settingsSchema.safeParse({
    fullname: formData.get('fullname'),
    mobile: formData.get('mobile'),
  });

  if (!validatedFields.success) {
    return { message: 'البيانات المدخلة غير صالحة', status: 'error' };
  }

  const { fullname, mobile } = validatedFields.data;

  await db.query('UPDATE users SET fullname = ?, mobile = ? WHERE id = ?', [fullname, mobile, session.id]);
  revalidatePath('/dashboard/settings'); // Re-fetch data on the page
  return { message: 'تم تحديث الإعدادات بنجاح!', status: 'success' };
}

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
  newPassword: z.string().min(6, 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل'),
  confirmPassword: z.string().min(6, 'تأكيد كلمة المرور مطلوب'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'كلمتا المرور غير متطابقتين',
  path: ['confirmPassword'],
});

export async function updatePassword(prevState, formData) {
  const session = await getSession();
  if (!session) {
    return { message: 'غير مصرح به', status: 'error' };
  }

  const validatedFields = passwordSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0];
    return { message: firstError || 'البيانات المدخلة غير صالحة', status: 'error' };
  }

  const { currentPassword, newPassword } = validatedFields.data;

  const [[user]] = await db.query('SELECT password FROM users WHERE id = ?', [session.id]);

  const passwordsMatch = await bcrypt.compare(currentPassword, user.password);
  if (!passwordsMatch) {
    return { message: 'كلمة المرور الحالية غير صحيحة', status: 'error' };
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 10);
  await db.query('UPDATE users SET password = ? WHERE id = ?', [newPasswordHash, session.id]);

  return { message: 'تم تحديث كلمة المرور بنجاح!', status: 'success' };
}
