import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getPaymobPaymentToken } from '@/lib/paymob.mjs';
import { getSession } from '@/lib/session';

export async function POST(request) {
  const authPayload = await getSession();
  if (!authPayload) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  const { cart, shippingDetails } = await request.json();

  if (!cart || cart.length === 0) {
    return NextResponse.json({ message: 'Cart is empty' }, { status: 400 });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // --- 1. Server-side validation and price calculation ---
    const productIds = cart.map(item => item.id);
    const [productsFromDb] = await connection.query(
      `SELECT id, price, stock FROM products WHERE id IN (?)`,
      [productIds]
    );

    let serverCalculatedTotal = 0;
    const productMap = new Map(productsFromDb.map(p => [p.id, p]));

    for (const item of cart) {
      const product = productMap.get(item.id);
      if (!product) {
        throw new Error(`Product with ID ${item.id} not found.`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Not enough stock for ${item.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
      }
      serverCalculatedTotal += product.price * item.quantity;
    }

    // --- 2. Create the Order ---
    const [orderResult] = await connection.query(
      `INSERT INTO orders (user_id, total_amount, status, shipping_address) VALUES (?, ?, ?, ?)`,
      [authPayload.id, serverCalculatedTotal, 'pending', JSON.stringify(shippingDetails)]
    );
    const orderId = orderResult.insertId;

    // --- 3. Create Order Items and prepare stock updates ---
    const orderItemsValues = [];
    const stockUpdatePromises = [];

    for (const item of cart) {
      const product = productMap.get(item.id);
      orderItemsValues.push([orderId, item.id, item.quantity, product.price]);

      // Prepare stock update query
      const newStock = product.stock - item.quantity;
      stockUpdatePromises.push(
        connection.query('UPDATE products SET stock = ? WHERE id = ?', [newStock, item.id])
      );
    }

    // Insert all order items in one query
    await connection.query(
      'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?',
      [orderItemsValues]
    );

    // Execute all stock updates
    await Promise.all(stockUpdatePromises);

    // --- 4. Get Paymob Payment Token ---
    const paymentToken = await getPaymobPaymentToken(
      serverCalculatedTotal,
      orderId,
      shippingDetails
    );

    // --- 5. Commit the transaction ---
    await connection.commit();

    return NextResponse.json({
      message: 'Order placed successfully!',
      orderId: orderId,
      paymentToken: paymentToken,
    }, { status: 201 });

  } catch (error) {
    // If any error occurs, roll back the transaction
    await connection.rollback();
    console.error('Failed to create order:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  } finally {
    // Always release the connection back to the pool
    connection.release();
  }
}
