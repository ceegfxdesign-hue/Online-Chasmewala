import { beforeEach, describe, it, expect } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { seedAll } from '../src/utils/seedData.js';
const app = createApp();
describe('Lens package uploads', () => {
 let token;
 beforeEach(async () => {
  await seedAll();
  const login = await request(app).post('/api/v1/auth/login').send({email:'admin@onlinechasmewala.com',password:'Admin@123'});
  token = login.body.data.accessToken;
 });
 it('requires admin authentication and rejects mismatched file content', async () => {
  expect((await request(app).post('/api/v1/admin/lens-media')).status).toBe(401);
  const invalid = await request(app).post('/api/v1/admin/lens-media').set('Authorization','Bearer '+token).attach('file',Buffer.from('not an image'),{filename:'bad.png',contentType:'image/png'});
  expect(invalid.status).toBe(400);
 });
 it('stores media separately and serves video ranges for playback', async () => {
  const bytes = Buffer.concat([Buffer.from([0,0,0,24]),Buffer.from('ftypisom'),Buffer.alloc(32)]);
  const upload = await request(app).post('/api/v1/admin/lens-media').set('Authorization','Bearer '+token).attach('file',bytes,{filename:'lens.mp4',contentType:'video/mp4'});
  expect(upload.status).toBe(201);
  const response = await request(app).get(upload.body.data.url).set('Range','bytes=0-7');
  expect(response.status).toBe(206);
  expect(response.headers['content-type']).toMatch(/video\/mp4/);
  expect(response.headers['content-range']).toBe('bytes 0-7/'+bytes.length);
  expect(response.headers['content-length']).toBe('8');
  expect((await request(app).get(upload.body.data.url).set('Range','bytes=999-1000')).status).toBe(416);
 });
});
