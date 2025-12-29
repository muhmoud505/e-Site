'use server';

import { revalidatePath, unstable_noStore as noStore } from 'next/cache';
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
  if (!session || !session.id) return { message: 'غير مصرح به', status: 'error' };

  const validatedFields = addressSchema.safeParse({
    country: formData.get('country'),
    city: formData.get('city'), 
    street: formData.get('street'),
    building_number: formData.get('building_number'),
  });

  if (!validatedFields.success) {
    // Return detailed validation errors
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'الرجاء تصحيح الأخطاء في النموذج.',
      status: 'error',
    };
  }

  const { country, city, street, building_number } = validatedFields.data;

  try {
    await db.query(
      'INSERT INTO user_addresses (user_id, country, city, street, building_number) VALUES (?, ?, ?, ?, ?)',
      [session.id, country, city, street, building_number]
    );
    revalidatePath('/dashboard/addresses');
    return { message: 'تم إضافة العنوان بنجاح!', status: 'success', errors: null };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'حدث خطأ أثناء إضافة العنوان.', status: 'error', errors: null };
  }
}

export async function deleteAddress(addressId) {
  const session = await getSession();
  if (!session || !session.id) {
    return { message: 'غير مصرح به', status: 'error' };
  }
  try {
    // First, check if the address to be deleted is the default one.
    const [[addressToDelete]] = await db.query(
      'SELECT is_default FROM user_addresses WHERE id = ? AND user_id = ?',
      [addressId, session.id]
    );

    // If it is the default, check if it's the only address.
    if (addressToDelete && addressToDelete.is_default) {
      const [[{ count }]] = await db.query('SELECT COUNT(*) as count FROM user_addresses WHERE user_id = ?', [session.id]);
      if (count <= 1) {
        return { message: 'لا يمكنك حذف عنوانك الافتراضي والوحيد. أضف عنوانًا آخر أولاً.', status: 'error' };
      }
    }

    // If checks pass, proceed with deletion.
    await db.query('DELETE FROM user_addresses WHERE id = ? AND user_id = ?', [addressId, session.id]);
    revalidatePath('/dashboard/addresses');
    return { message: 'تم حذف العنوان بنجاح.', status: 'success' };
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'فشل حذف العنوان.', status: 'error' };
  }
}

export async function setDefaultAddress(addressId) {
  const session = await getSession();
  if (!session || !session.id) {
    return { message: 'غير مصرح به', status: 'error' };
  }

  // Using a transaction ensures that both updates succeed or neither does.
  await db.query('START TRANSACTION');
  try {
    // 1. Unset any existing default address for the user to ensure only one is default.
    await db.query(
      'UPDATE user_addresses SET is_default = FALSE WHERE user_id = ? AND is_default = TRUE',
      [session.id]
    );

    // 2. Set the new default address.
    await db.query(
      'UPDATE user_addresses SET is_default = TRUE WHERE id = ? AND user_id = ?',
      [addressId, session.id]
    );

    await db.query('COMMIT');
    revalidatePath('/dashboard/addresses');
    return { message: 'تم تعيين العنوان كافتراضي بنجاح.', status: 'success' };
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('Database Error:', error);
    return { message: 'فشل في تعيين العنوان الإفتراضي.', status: 'error' };
  }
}

export async function getAddresses() {
  noStore();
  const session = await getSession();

  // --- DEBUGGING STEP ---
  // Check your server terminal (where you run `npm run dev`) for this log.
  console.log('Fetching addresses for session:', session);

  if (!session || !session.id) {
    // Return empty array if user is not logged in
    return [];
  }

  try {
    console.log(session);
    
    const [addresses] = await db.query(
      'SELECT id, country, city, street, building_number, is_default FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
      [session.id]
    );
    console.log(addresses);
    
    return addresses;
  } catch (error) {
    console.error('Failed to fetch addresses:', error);
    return []; // Return empty on error to prevent page crash
  }
}