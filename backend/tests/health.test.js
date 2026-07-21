import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../src/app.js';

const app = createApp();

describe('GET /api/v1/health', () => {
  it('returns a healthy status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ok');
  });
});

describe('unknown routes', () => {
  it('returns a 404 envelope', async () => {
    const res = await request(app).get('/api/v1/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
