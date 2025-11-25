import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
    
  try {
    const [users] = await db.query(
      `SELECT id, fullname, email, role, DATE_FORMAT(created_at, '%Y-%m-%d') as join_date 
       FROM users 
       ORDER BY created_at DESC`
    );
    console.log('there is not users here');
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ message: 'Failed to fetch users' }, { status: 500 });
  }
}

