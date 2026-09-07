import { describe, it, expect, jest } from '@jest/globals';
import crypto from 'node:crypto';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { envSchema } from '../src/config/env.js';
import { passwordSchema } from '../src/validators/password.js';
import { changePasswordSchema } from '../src/validators/account.validator.js';
import { otpProvider } from '../src/services/providers/otpProvider.js';
import { logger } from '../src/config/logger.js';
import { resolvePaymentProvider } from '../src/services/providers/paymentProvider.js';

describe('Security configuration', () => {
  const production = {
    NODE_ENV: 'production',
    MONGODB_URI: 'mongodb://localhost/test',
    CLIENT_URL: 'https://example.com',
    JWT_ACCESS_SECRET: crypto.randomBytes(32).toString('hex'),
    JWT_REFRESH_SECRET: crypto.randomBytes(32).toString('hex'),
    PAYMENT_PROVIDER: 'stripe',
  };
  it('rejects default secrets and mock payments in production', () => {
    expect(envSchema.safeParse(production).success).toBe(true);
    expect(envSchema.safeParse({ ...production, PAYMENT_PROVIDER: 'mock' }).success).toBe(false);
    expect(
      envSchema.safeParse({
        ...production,
        JWT_ACCESS_SECRET: 'change_me_dev_access_secret_please_use_openssl_rand_hex_32',
      }).success
    ).toBe(false);
    expect(
      envSchema.safeParse({ ...production, JWT_REFRESH_SECRET: production.JWT_ACCESS_SECRET })
        .success
    ).toBe(false);
  });
  it('requires complexity only for new passwords', () => {
    expect(passwordSchema.safeParse('Letters1').success).toBe(true);
    expect(
      changePasswordSchema.body.safeParse({ currentPassword: 'legacy', newPassword: 'Letters1' })
        .success
    ).toBe(true);
    for (const password of ['abcdef', 'abcdefgh', '12345678'])
      expect(passwordSchema.safeParse(password).success).toBe(false);
  });
  it('never falls back to mock processing for an unimplemented gateway', async () => {
    await expect(resolvePaymentProvider('stripe').capture({})).rejects.toMatchObject({
      statusCode: 503,
    });
    await expect(resolvePaymentProvider('razorpay').refund({})).rejects.toMatchObject({
      statusCode: 503,
    });
  });
  it('sends mock OTPs only to the server logger', async () => {
    const log = jest.spyOn(logger, 'info').mockImplementation(() => logger);
    try {
      expect(
        await otpProvider.send({
          destination: 'test@example.com',
          code: '123456',
          purpose: 'reset',
        })
      ).toEqual({ delivered: true });
      expect(log).toHaveBeenCalledWith(expect.stringContaining('123456'));
    } finally {
      log.mockRestore();
    }
  });
});
describe('Coupon abuse prevention', () => {
  it('returns 429 after fifteen validation attempts', async () => {
    const app = createApp();
    const signup = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Coupon User', email: 'coupon@example.com', password: 'Coupon123' });
    const token = signup.body.data.accessToken;
    for (let i = 0; i < 15; i++) {
      const response = await request(app)
        .post('/api/v1/coupons/validate')
        .set('Authorization', 'Bearer ' + token)
        .send({ code: 'UNKNOWN', subtotal: 1500 });
      expect(response.status).not.toBe(429);
    }
    const blocked = await request(app)
      .post('/api/v1/coupons/validate')
      .set('Authorization', 'Bearer ' + token)
      .send({ code: 'UNKNOWN', subtotal: 1500 });
    expect(blocked.status).toBe(429);
    expect(blocked.headers['retry-after']).toBeDefined();
  });
});
