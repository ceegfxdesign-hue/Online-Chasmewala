/**
 * Payment provider interface + mock implementation.
 *
 * The mock creates a pseudo payment intent and marks it paid immediately (except
 * for an explicit failing test card), enabling the full checkout flow without a
 * real gateway. Razorpay/Stripe implementations satisfy the same interface and
 * are selected via PAYMENT_PROVIDER.
 */
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

const providers = {
  mock: new MockPaymentProvider(),
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
