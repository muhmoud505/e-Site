import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

async function getSession() {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(sessionCookie, secret);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { fullname, email, role } = await request.json();
    const session = await getSession();

    // Basic validation
    if (!fullname || !email || !role) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Security check: Prevent a user from editing their own data via this admin route.
    if (session?.id === Number(id)) {
      return NextResponse.json({ message: 'You cannot edit your own profile here.' }, { status: 403 });
    }

    await db.query(
      'UPDATE users SET fullname = ?, email = ?, role = ? WHERE id = ?',
      [fullname, email, role, id]
    );

    return NextResponse.json({ message: 'User updated successfully' });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ message: 'Failed to update user' }, { status: 500 });
  }
}
