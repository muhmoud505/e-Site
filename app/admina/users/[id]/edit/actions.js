'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcrypt';

export async function updateUserAction(id, prevState, formData) {
  const fullname = formData.get('fullname');
  const email = formData.get('email');
  const mobile = formData.get('mobile');
  const role = formData.get('role');
  const password = formData.get('password');

  try {
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.query(
        'UPDATE users SET fullname = ?, email = ?, mobile = ?, role = ?, password = ? WHERE id = ?',
        [fullname, email, mobile, role, hashedPassword, id]
      );
    } else {
      await db.query(
        'UPDATE users SET fullname = ?, email = ?, mobile = ?, role = ? WHERE id = ?',
        [fullname, email, mobile, role, id]
      );
    }

    revalidatePath('/admina/users');
    return { status: 'success', message: 'تم تحديث بيانات المستخدم بنجاح' };
  } catch (error) {
    console.error('Failed to update user:', error);
    return { status: 'error', message: 'حدث خطأ أثناء تحديث البيانات.' };
  }
}

export async function deleteUserAction(id) {
  try {
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    revalidatePath('/admina/users');
    return { status: 'success', message: 'تم حذف المستخدم بنجاح' };
  } catch (error) {
    console.error('Failed to delete user:', error);
    return { status: 'error', message: 'حدث خطأ أثناء حذف المستخدم.' };
  }
}

export async function bulkDeleteUsersAction(ids) {
  try {
    if (!ids || ids.length === 0) return { status: 'error', message: 'لم يتم تحديد أي مستخدمين' };
    const placeholders = ids.map(() => '?').join(',');
    await db.query(`DELETE FROM users WHERE id IN (${placeholders})`, ids);
    revalidatePath('/admina/users');
    return { status: 'success', message: 'تم حذف المستخدمين المحددين بنجاح' };
  } catch (error) {
    console.error('Failed to bulk delete users:', error);
    return { status: 'error', message: 'حدث خطأ أثناء حذف المستخدمين.' };
  }
}