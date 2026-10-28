/**
 * Payment provider interface + implementations (Mock and Razorpay).
 *
 * Mock provider enables full local and automated testing without credentials.
 * Razorpay provider creates orders, verifies HMAC-SHA256 signatures, and processes refunds.
 */
import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';

class MockPaymentProvider {
  /** Create an intent the client would normally confirm. */
  async createIntent({ amount, currency = 'INR', orderNumber }) {
    return {
      provider: 'mock',
      intentId: `pi_mock_${orderNumber}`,
      amount,
      currency,
      clientSecret: `secret_mock_${orderNumber}`,
    };
  }

  /**
   * "Capture" a payment. Returns paid unless the caller passes the reserved
   * failing token `tok_fail` (used to exercise the order-failed path).
   */
  async capture({ orderNumber, method, token }) {
    if (token === 'tok_fail') {
      return { status: 'failed', transactionId: null, provider: 'mock' };
    }
    return {
      status: 'paid',
      transactionId: `txn_mock_${orderNumber}_${method}`,
      provider: 'mock',
      paidAt: new Date(),
    };
  }

  async refund({ transactionId, amount }) {
    return { status: 'processed', refundId: `rf_mock_${transactionId}`, amount, provider: 'mock' };
  }
}

class RazorpayPaymentProvider {
  constructor() {
    this.client = null;
  }

  getClient() {
    const keyId = process.env.RAZORPAY_KEY_ID ?? env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET ?? env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      this.client = null;
      throw new ApiError(503, 'Razorpay credentials are not configured.');
    }
    if (!this.client) {
      this.client = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
    }
    return this.client;
  }

  /**
   * Create an official Razorpay order for checkout popup initiation.
   */
  async createIntent({ amount, currency = 'INR', orderNumber }) {
    const client = this.getClient();
    const amountInPaise = Math.round(Number(amount) * 100);

    try {
      const order = await client.orders.create({
        amount: amountInPaise,
        currency: currency.toUpperCase(),
        receipt: (orderNumber || `rcpt_${Date.now()}`).slice(0, 40),
        notes: {
          orderNumber: orderNumber || '',
        },
      });

      return {
        provider: 'razorpay',
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: env.RAZORPAY_KEY_ID,
      };
    } catch (err) {
      throw new ApiError(502, `Failed to create Razorpay order: ${err.error?.description || err.message}`);
    }
  }

  /**
   * Cryptographically verify Razorpay payment signature.
   */
  async capture({ orderNumber, method, token, amount }) {
    if (!token) {
      return { status: 'failed', transactionId: null, provider: 'razorpay', reason: 'Missing payment token' };
    }

    let payload = token;
    if (typeof token === 'string') {
      try {
        payload = JSON.parse(token);
      } catch {
        payload = { razorpay_payment_id: token };
      }
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = payload;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return {
        status: 'failed',
        transactionId: razorpay_payment_id || null,
        provider: 'razorpay',
        reason: 'Missing Razorpay verification parameters',
      };
    }

    // HMAC SHA-256 signature verification
    const secret = process.env.RAZORPAY_KEY_SECRET ?? env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      throw new ApiError(503, 'Razorpay credentials are not configured.');
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return {
        status: 'failed',
        transactionId: razorpay_payment_id,
        provider: 'razorpay',
        reason: 'Invalid payment signature',
      };
    }

    return {
      status: 'paid',
      transactionId: razorpay_payment_id,
      orderId: razorpay_order_id,
      provider: 'razorpay',
      paidAt: new Date(),
    };
  }

  /**
   * Trigger a refund for a payment via Razorpay API.
   */
  async refund({ transactionId, amount }) {
    const client = this.getClient();
    try {
      const options = {};
      if (amount) options.amount = Math.round(Number(amount) * 100);
      const res = await client.payments.refund(transactionId, options);
      return {
        status: 'processed',
        refundId: res.id,
        amount: res.amount / 100,
        provider: 'razorpay',
      };
    } catch (err) {
      throw new ApiError(502, `Razorpay refund failed: ${err.error?.description || err.message}`);
    }
  }
}

export const providers = {
  mock: new MockPaymentProvider(),
  razorpay: new RazorpayPaymentProvider(),
};

export function resolvePaymentProvider(name) {
  if (providers[name]) return providers[name];
  const unavailable = async () => {
    throw new ApiError(503, 'Online payments are not configured. Please use cash on delivery.');
  };
  // Keep catalogue/COD available without ever marking an unprocessed payment paid.
  return { createIntent: unavailable, capture: unavailable, refund: unavailable };
}
export const paymentProvider = resolvePaymentProvider(env.PAYMENT_PROVIDER);
export default paymentProvider;
