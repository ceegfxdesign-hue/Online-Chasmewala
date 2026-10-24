import crypto from 'node:crypto';
import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { seedAll } from '../src/utils/seedData.js';
import { paymentProvider } from '../src/services/providers/paymentProvider.js';
import { env } from '../src/config/env.js';

const app = createApp();

async function demoToken() {
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'demo@onlinechasmewala.com', password: 'Demo@123' });
  return res.body.data.accessToken;
}

async function firstInStockProduct() {
  const res = await request(app).get('/api/v1/products?inStock=true&limit=1');
  return res.body.data[0];
}

describe('Razorpay payment integration & signature verification', () => {
  let token;
  let product;

  beforeEach(async () => {
    await seedAll();
    token = await demoToken();
    product = await firstInStockProduct();
  });

  const auth = () => ({ Authorization: `Bearer ${token}` });

  it('rejects create-payment-intent when cart is empty', async () => {
    const res = await request(app)
      .post('/api/v1/orders/create-payment-intent')
      .set(auth())
      .send({ deliveryMethod: 'standard' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/empty/i);
  });

  it('generates a payment intent when cart has items', async () => {
    await request(app)
      .post('/api/v1/cart/items')
      .set(auth())
      .send({ productId: product._id, quantity: 1 });

    const res = await request(app)
      .post('/api/v1/orders/create-payment-intent')
      .set(auth())
      .send({ deliveryMethod: 'standard' });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('provider');
    expect(res.body.data).toHaveProperty('pricing');
    expect(res.body.data.pricing.total).toBeGreaterThan(0);
  });

  it('verifies valid HMAC-SHA256 signature correctly with RazorpayPaymentProvider', async () => {
    const testSecret = 'rzp_test_secret_for_unit_tests_123456';
    const originalSecret = process.env.RAZORPAY_KEY_SECRET;
    process.env.RAZORPAY_KEY_SECRET = testSecret;

    try {
      const orderId = 'order_test_987654321';
      const paymentId = 'pay_test_123456789';
      const validSignature = crypto
        .createHmac('sha256', testSecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      const { providers } = await import('../src/services/providers/paymentProvider.js');
      const rzpInstance = providers.razorpay;

      const successResult = await rzpInstance.capture({
        orderNumber: 'OC-TEST-001',
        method: 'card',
        token: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: validSignature,
        }),
      });

      expect(successResult.status).toBe('paid');
      expect(successResult.transactionId).toBe(paymentId);
      expect(successResult.provider).toBe('razorpay');

      // Tampered / invalid signature
      const tamperedResult = await rzpInstance.capture({
        orderNumber: 'OC-TEST-001',
        method: 'card',
        token: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: 'invalid_forged_signature_0000',
        }),
      });

      expect(tamperedResult.status).toBe('failed');
      expect(tamperedResult.reason).toBe('Invalid payment signature');

      // Missing parameters
      const missingResult = await rzpInstance.capture({
        orderNumber: 'OC-TEST-001',
        method: 'card',
        token: JSON.stringify({
          razorpay_payment_id: paymentId,
        }),
      });

      expect(missingResult.status).toBe('failed');
      expect(missingResult.reason).toBe('Missing Razorpay verification parameters');
    } finally {
      process.env.RAZORPAY_KEY_SECRET = originalSecret;
    }
  });
});
