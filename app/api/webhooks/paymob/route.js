import { NextResponse } from 'next/server';
import crypto from 'crypto';
import db from '@/lib/db';

/**
 * Verifies the HMAC signature from Paymob to ensure the request is authentic.
 * @param {URLSearchParams} searchParams - The query parameters from the request URL.
 * @param {object} payload - The JSON body of the request.
 * @returns {boolean} - True if the HMAC is valid, false otherwise.
 */
function verifyPaymobHmac(searchParams, payload) {
  const hmacFromPaymob = searchParams.get('hmac');
  if (!hmacFromPaymob) {
    return false;
  }

  // The fields must be concatenated in alphabetical order.
  const concatenatedString =
    payload.amount_cents +
    payload.created_at +
    payload.currency +
    payload.error_occured +
    payload.has_parent_transaction +
    payload.id +
    payload.integration_id +
    payload.is_3d_secure +
    payload.is_auth +
    payload.is_capture +
    payload.is_refunded +
    payload.is_standalone_payment +
    payload.is_voided +
    payload.order.id +
    payload.owner +
    payload.pending +
    payload.source_data.pan +
    payload.source_data.sub_type +
    payload.source_data.type +
    payload.success;

  const hmac = crypto.createHmac('sha512', process.env.PAYMOB_HMAC_SECRET);
  const calculatedHmac = hmac.update(concatenatedString).digest('hex');

  return calculatedHmac === hmacFromPaymob;
}

export async function POST(request) {
  const connection = await db.getConnection();
  try {
    const { searchParams } = new URL(request.url);
    const body = await request.json();
    const { obj: transactionData } = body; // The transaction data is in the 'obj' property

    // 1. Verify the HMAC signature
    if (!verifyPaymobHmac(searchParams, transactionData)) {
      console.warn('Invalid Paymob HMAC received.');
      return NextResponse.json({ message: 'Invalid HMAC' }, { status: 401 });
    }

    // 2. Extract relevant data
    const orderId = transactionData.order.merchant_order_id;
    const paymobTransactionId = transactionData.id;
    const isSuccess = transactionData.success;

    await connection.beginTransaction();

    // 3. Find the order and check its status to prevent reprocessing
    const [[order]] = await connection.query('SELECT id, status FROM orders WHERE id = ? FOR UPDATE', [orderId]);

    if (!order) {
      throw new Error(`Webhook received for non-existent order ID: ${orderId}`);
    }

    // If order is already processed, just return success. This makes the webhook idempotent.
    if (order.status === 'paid' || order.status === 'failed') {
      console.log(`Order ${orderId} already processed. Current status: ${order.status}`);
      await connection.commit();
      return NextResponse.json({ message: 'Already processed' }, { status: 200 });
    }

    // 4. Update order status based on payment outcome
    if (isSuccess) {
      // PAYMENT SUCCESSFUL
      await connection.query(
        'UPDATE orders SET status = ?, paymob_transaction_id = ? WHERE id = ?',
        ['paid', paymobTransactionId, orderId]
      );
    } else {
      // PAYMENT FAILED
      await connection.query(
        'UPDATE orders SET status = ?, paymob_transaction_id = ? WHERE id = ?',
        ['failed', paymobTransactionId, orderId]
      );

      // IMPORTANT: Return the stock for the failed order
      const [orderItems] = await connection.query('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [orderId]);
      for (const item of orderItems) {
        await connection.query('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.product_id]);
      }
    }

    await connection.commit();

    return NextResponse.json({ message: 'Webhook processed successfully' }, { status: 200 });

  } catch (error) {
    await connection.rollback();
    console.error('Paymob webhook processing failed:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  } finally {
    connection.release();
  }
}