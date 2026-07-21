import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../src/app.js';

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

  it('supports the OTP request/verify flow (mock provider returns dev code)', async () => {
    await register();
    const reqOtp = await request(app)
      .post('/api/v1/auth/otp/request')
      .send({ email: validUser.email, purpose: 'reset' });
    expect(reqOtp.status).toBe(200);
    const devCode = reqOtp.body.data.devCode;
    expect(devCode).toMatch(/^\d{6}$/);

    const verify = await request(app)
      .post('/api/v1/auth/otp/verify')
      .send({ email: validUser.email, code: devCode, newPassword: 'NewSecret@1' });
    expect(verify.status).toBe(200);

    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: validUser.email, password: 'NewSecret@1' });
    expect(login.status).toBe(200);
  });
});
