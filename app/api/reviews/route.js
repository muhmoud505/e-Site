import { NextResponse } from 'next/server';
import { getSession } from '../../../lib/session'; // Use your custom session handler
// Import your database connection utility, e.g., for MySQL, PostgreSQL, etc.
import db from '../../../lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');

  if (!productId) {
    return NextResponse.json({ message: 'Product ID is required' }, { status: 400 });
  }

  try {
    const [reviews] = await db.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.fullname as author
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC`,
      [productId]
    );

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ message: 'حدث خطأ أثناء جلب المراجعات' }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getSession();

  // 1. Check for Authentication
  if (!session || !session.id) {
    return NextResponse.json({ message: 'يجب عليك تسجيل الدخول أولاً' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { productId, rating, comment } = body;
    const userId = session.id; // Get user ID from your custom session

    // 2. Validate Input
    if (!productId || !rating || !comment) {
      return NextResponse.json({ message: 'التقييم والتعليق حقول مطلوبة' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ message: 'يجب أن يكون التقييم بين 1 و 5' }, { status: 400 });
    }

    // 3. (Optional but recommended) Check if the user has already reviewed this product.
    const [existingReview] = await db.query(
      'SELECT id FROM reviews WHERE product_id = ? AND user_id = ?',
      [productId, userId]
    );

    if (existingReview.length > 0) {
      return NextResponse.json({ message: 'لقد قمت بمراجعة هذا المنتج بالفعل' }, { status: 409 });
    }

    // 4. Create the Review in your Database.
    const [result] = await db.query(
      'INSERT INTO reviews (rating, comment, product_id, user_id) VALUES (?, ?, ?, ?)',
      [rating, comment, productId, userId]
    );

    const newReview = { id: result.insertId, rating, comment, productId, userId };

    // TODO: After creating the review, you should also update the product's average rating.
    // This can be done here with another database query or with a database trigger.

    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ message: 'حدث خطأ أثناء إرسال المراجعة' }, { status: 500 });
  }
}