import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import db from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const [addresses] = await db.query(
      'SELECT * FROM addresses WHERE user_id = ?',
      [session.user.id]
    );

    return NextResponse.json(addresses);
  } catch (error) {
    console.error('[ADDRESSES_GET]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
