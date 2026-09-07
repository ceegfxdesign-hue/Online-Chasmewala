import { describe, it, expect, jest, afterEach } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { otpProvider } from '../src/services/providers/otpProvider.js';
import { User } from '../src/models/User.js';

afterEach(() => jest.restoreAllMocks());

async function requestCode() {
  const delivery = jest.spyOn(otpProvider, 'send').mockResolvedValue({ delivered: true });
  const response = await request(app)
    .post('/api/v1/auth/otp/request')
    .send({ email: validUser.email, purpose: 'reset' });
  expect(response.body.data).toEqual({ sent: true });
  return delivery.mock.calls.at(-1)[0].code;
}

const app = createApp();

const validUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'Secret@123',
};

async function register(overrides = {}) {
  return request(app)
    .post('/api/v1/auth/register')
    .send({ ...validUser, ...overrides });
}

describe('Auth flow', () => {
  it('registers a new user and returns an access token + refresh cookie', async () => {
    const res = await register();
    expect(res.status).toBe(201);
    expect(res.body.data.user.email).toBe(validUser.email);
    expect(res.body.data.user.password).toBeUndefined();
    expect(res.body.data.accessToken).toBeTruthy();
    expect(res.headers['set-cookie']?.join(';')).toMatch(/oc_refresh/);
  });

  it('rejects duplicate registration', async () => {
    await register();
    const res = await register();
    expect(res.status).toBe(409);
  });

  it('validates the registration payload', async () => {
    const res = await register({ email: 'not-an-email', password: '123' });
    expect(res.status).toBe(422);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  it('logs in with correct credentials and rejects wrong ones', async () => {
    await register();
    const ok = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: validUser.email, password: validUser.password });
    expect(ok.status).toBe(200);
    expect(ok.body.data.accessToken).toBeTruthy();

    const bad = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: validUser.email, password: 'wrong' });
    expect(bad.status).toBe(401);
  });

  it('returns the current user from /me with a bearer token', async () => {
    const reg = await register();
    const token = reg.body.data.accessToken;
    const me = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${token}`);
    expect(me.status).toBe(200);
    expect(me.body.data.user.email).toBe(validUser.email);
  });

  it('rejects /me without a token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('refreshes the session using the refresh cookie and rotates it', async () => {
    const reg = await register();
    const cookie = reg.headers['set-cookie'];
    const res = await request(app).post('/api/v1/auth/refresh').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeTruthy();
    expect(res.headers['set-cookie']?.join(';')).toMatch(/oc_refresh/);
  });

  it('supports OTP reset without exposing the code in an HTTP response', async () => {
    await register();
    const code = await requestCode();

    const verify = await request(app)
      .post('/api/v1/auth/otp/verify')
      .send({ email: validUser.email, code, newPassword: 'NewSecret@1' });
    expect(verify.status).toBe(200);

    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: validUser.email, password: 'NewSecret@1' });
    expect(login.status).toBe(200);
  });
  it.each(['short1', 'abcdefgh', '12345678'])(
    'rejects weak signup and reset passwords: %s',
    async (password) => {
      expect((await register({ password })).status).toBe(422);
      await register();
      const code = await requestCode();
      const reset = await request(app)
        .post('/api/v1/auth/otp/verify')
        .send({ email: validUser.email, code, newPassword: password });
      expect(reset.status).toBe(422);
    }
  );
  it('preserves login for existing six-character passwords and missing OTP counters', async () => {
    const user = await User.create({ ...validUser, password: 'legacy' });
    await User.collection.updateOne({ _id: user._id }, { $unset: { otpAttempts: '' } });
    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: validUser.email, password: 'legacy' });
    expect(login.status).toBe(200);
    expect(login.body.data.user.otpAttempts).toBeUndefined();
    const code = await requestCode();
    expect(
      (await request(app).post('/api/v1/auth/otp/verify').send({ email: validUser.email, code }))
        .status
    ).toBe(200);
  });
  it('invalidates on the fifth wrong attempt, blocks the correct code, and allows a new OTP', async () => {
    await register();
    const code = await requestCode();
    const wrong = code === '000000' ? '111111' : '000000';
    for (let i = 0; i < 5; i++) {
      const response = await request(app)
        .post('/api/v1/auth/otp/verify')
        .send({ email: validUser.email, code: wrong });
      expect(response.status).toBe(400);
      if (i === 4)
        expect(response.body.message).toBe('Too many failed attempts. Please request a new OTP.');
    }
    const locked = await User.findOne({ email: validUser.email }).select(
      '+otpHash +otpExpiresAt +otpAttempts'
    );
    expect(locked.otpHash).toBeUndefined();
    expect(locked.otpExpiresAt).toBeUndefined();
    expect(locked.otpAttempts).toBe(0);
    expect(
      (await request(app).post('/api/v1/auth/otp/verify').send({ email: validUser.email, code }))
        .status
    ).toBe(400);
    const fresh = await requestCode();
    expect(
      (
        await request(app)
          .post('/api/v1/auth/otp/verify')
          .send({ email: validUser.email, code: fresh })
      ).status
    ).toBe(200);
  });
  it('caps concurrent guesses and consumes a successful OTP only once', async () => {
    await register();
    const code = await requestCode();
    const wrong = code === '000000' ? '111111' : '000000';
    const failures = await Promise.all(
      Array.from({ length: 8 }, () =>
        request(app).post('/api/v1/auth/otp/verify').send({ email: validUser.email, code: wrong })
      )
    );
    expect(failures.every((response) => response.status === 400)).toBe(true);
    expect(
      (await User.findOne({ email: validUser.email }).select('+otpHash')).otpHash
    ).toBeUndefined();
    const fresh = await requestCode();
    const successes = await Promise.all(
      Array.from({ length: 2 }, () =>
        request(app).post('/api/v1/auth/otp/verify').send({ email: validUser.email, code: fresh })
      )
    );
    expect(successes.filter((response) => response.status === 200)).toHaveLength(1);
  });
});
