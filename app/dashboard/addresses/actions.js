'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import db from '@/lib/db';
import { getSession } from '@/lib/session';

const addressSchema = z.object({
  country: z.string().min(2, 'الدولة مطلوبة'),
  city: z.string().min(2, 'المدينة مطلوبة'),
  street: z.string().min(3, 'الشارع مطلوب'),
  building_number: z.string().min(1, 'رقم المبنى مطلوب'),
});

export async function addAddress(prevState, formData) {
  const session = await getSession();
  if (!session) return { message: 'غير مصرح به', status: 'error' };

  const validatedFields = addressSchema.safeParse({
    country: formData.get('country'),
    city: formData.get('city'),
    street: formData.get('street'),
    building_number: formData.get('building_number'),
  });

  if (!validatedFields.success) {
    return { message: 'البيانات المدخلة غير صالحة.', status: 'error' };
  }

  const { country, city, street, building_number } = validatedFields.data;

  try {
    await db.query(
      'INSERT INTO user_addresses (user_id, country, city, street, building_number) VALUES (?, ?, ?, ?, ?)',
      [session.userId, country, city, street, building_number]
    );
    revalidatePath('/dashboard/addresses');
    return { message: 'تم إضافة العنوان بنجاح!', status: 'success' };
  } catch (error) {
    return { message: 'حدث خطأ أثناء إضافة العنوان.', status: 'error' };
  }
}

export async function deleteAddress(addressId) {
    const session = await getSession();
    if (!session) throw new Error('غير مصرح به');

    await db.query('DELETE FROM user_addresses WHERE id = ? AND user_id = ?', [addressId, session.userId]);
    revalidatePath('/dashboard/addresses');
}

export async function setDefaultAddress(addressId) {
    const session = await getSession();
    if (!session) throw new Error('غير مصرح به');

    const connection = await db.query('START TRANSACTION');
    try {
        // First, unset any existing default address for the user
        await db.query(
            'UPDATE user_addresses SET is_default = FALSE WHERE user_id = ? AND is_default = TRUE',
            [session.userId]
        );

        // Then, set the new default address
        await db.query(
            'UPDATE user_addresses SET is_default = TRUE WHERE id = ? AND user_id = ?',
            [addressId, session.userId]
        );

        await db.query('COMMIT');
    } catch (error) {
        await db.query('ROLLBACK');
        throw new Error('فشل في تعيين العنوان الإفتراضي.');
    }

    revalidatePath('/dashboard/addresses');
}