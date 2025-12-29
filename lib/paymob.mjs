/**
 * Performs the 3-step Paymob handshake to get a payment token.
 * @param {number} amountEgp - The total amount in EGP.
 * @param {number} orderId - Your internal order ID.
 * @param {object} billingData - Customer billing data.
 * @returns {Promise<string>} The final payment token for the iframe.
 */
export const getPaymobPaymentToken = async (amountEgp, orderId, billingData) => {
  // 1. Authentication Request
  let authResult;
  try {
    const authResponse = await fetch('https://accept.paymob.com/api/auth/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: process.env.PAYMOB_API_KEY }),
    });
    authResult = await authResponse.json();
    if (!authResponse.ok || !authResult.token) {
      throw new Error(`Paymob Auth failed: ${authResult.detail || 'Authentication error'}`);
    }
  } catch (e) {
    throw new Error(`Paymob Auth request failed: ${e.message}`);
  }
  const token = authResult.token;

  // 2. Order Registration Request
  const orderResponse = await fetch('https://accept.paymob.com/api/ecommerce/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      auth_token: token,
      delivery_needed: 'false',
      amount_cents: Math.round(amountEgp * 100), // Paymob requires amount in cents
      currency: 'EGP',
      merchant_order_id: orderId, // Your internal order ID
      items: [], // You can add item details here if needed
    }),
  });
  if (!orderResponse.ok) {
    const errorDetail = await orderResponse.text();
    throw new Error(`Paymob Order Registration failed: ${errorDetail}`);
  }
  const orderResult = await orderResponse.json();
  const paymobOrderId = orderResult.id;

  // 3. Payment Key Request
  const keyResponse = await fetch('https://accept.paymob.com/api/acceptance/payment_keys', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      auth_token: token,
      amount_cents: Math.round(amountEgp * 100),
      expiration: 3600, // Token expires in 1 hour (3600 seconds)
      order_id: paymobOrderId,
      billing_data: {
        // These are mandatory fields, even if you send "NA"
        first_name: billingData.firstName || 'NA',
        last_name: billingData.lastName || 'NA',
        email: billingData.email || 'NA',
        phone_number: billingData.phone || 'NA',
        apartment: 'NA',
        floor: 'NA',
        street: 'NA',
        building: 'NA',
        shipping_method: 'NA',
        postal_code: 'NA',
        city: 'NA',
        country: 'NA',
        state: 'NA',
      },
      currency: 'EGP',
      integration_id: process.env.PAYMOB_INTEGRATION_ID,
    }),
  });
  if (!keyResponse.ok) {
    const errorDetail = await keyResponse.text();
    throw new Error(`Paymob Payment Key request failed: ${errorDetail}`);
  }

  const keyResult = await keyResponse.json();
  return keyResult.token;
};