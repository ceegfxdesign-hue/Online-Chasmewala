import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { seedAll } from '../src/utils/seedData.js';
import { Order, Product, Review } from '../src/models/index.js';

const app = createApp();

async function login(email, password) {
  const res = await request(app).post('/api/v1/auth/login').send({ email, password });
  return res.body.data;
}

const address = {
  fullName: 'Demo Customer',
  phone: '9000000000',
  line1: '12 MG Road',
  city: 'Bengaluru',
  state: 'Karnataka',
  pincode: '560001',
};

describe('Account APIs', () => {
  let token;
  let user;

  beforeEach(async () => {
    await seedAll();
    const data = await login('demo@onlinechasmewala.com', 'Demo@123');
    token = data.accessToken;
    user = data.user;
  });

  const auth = () => ({ Authorization: `Bearer ${token}` });

  it('updates the profile', async () => {
    const res = await request(app)
      .patch('/api/v1/account/profile')
      .set(auth())
      .send({ name: 'Demo Updated', preferences: { newsletter: false } });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Demo Updated');
    expect(res.body.data.preferences.newsletter).toBe(false);
  });

  it('changes the password and rejects a wrong current password', async () => {
    const bad = await request(app)
      .post('/api/v1/account/change-password')
      .set(auth())
      .send({ currentPassword: 'wrong', newPassword: 'NewPass@1' });
    expect(bad.status).toBe(400);

    const ok = await request(app)
      .post('/api/v1/account/change-password')
      .set(auth())
      .send({ currentPassword: 'Demo@123', newPassword: 'NewPass@1' });
    expect(ok.status).toBe(200);

    const relogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'demo@onlinechasmewala.com', password: 'NewPass@1' });
    expect(relogin.status).toBe(200);
  });

  it('manages addresses (add, update default, remove)', async () => {
    const added = await request(app)
      .post('/api/v1/account/addresses')
      .set(auth())
      .send({ ...address, label: 'Work', line1: '99 Tech Park' });
    expect(added.status).toBe(201);
    expect(added.body.data.length).toBe(2); // seed address + new

    const newAddr = added.body.data.find((a) => a.label === 'Work');
    const updated = await request(app)
      .patch(`/api/v1/account/addresses/${newAddr._id}`)
      .set(auth())
      .send({ isDefault: true });
    expect(updated.body.data.find((a) => a.label === 'Work').isDefault).toBe(true);

    const removed = await request(app).delete(`/api/v1/account/addresses/${newAddr._id}`).set(auth());
    expect(removed.body.data.length).toBe(1);
    expect(removed.body.data[0].isDefault).toBe(true); // default reassigned
  });

  it('saves a card storing only display data + token', async () => {
    const res = await request(app)
      .post('/api/v1/account/cards')
      .set(auth())
      .send({ number: '4111 1111 1111 1234', expiryMonth: 12, expiryYear: 2030, holderName: 'Demo' });
    expect(res.status).toBe(201);
    const card = res.body.data[0];
    expect(card.last4).toBe('1234');
    expect(card.token).toMatch(/^tok_/);
    expect(JSON.stringify(res.body)).not.toContain('4111');
  });

  it('writes a review (verified when purchased), lists and deletes it', async () => {
    // Place a COD order and mark it delivered so the review is "verified".
    const reviewedProductIds = (await Review.distinct('product', { user: user._id })).map(String);
    const product = await Product.findOne({ _id: { $nin: reviewedProductIds }, stock: { $gt: 0 } });
    expect(product).toBeDefined();
    await request(app).post('/api/v1/cart/items').set(auth()).send({ productId: product._id, quantity: 1 });
    const order = await request(app)
      .post('/api/v1/orders')
      .set(auth())
      .send({ shippingAddress: address, paymentMethod: 'cod' });
    expect(order.status).toBe(201);

    const review = await request(app)
      .post(`/api/v1/products/${product.slug}/reviews`)
      .set(auth())
      .send({ rating: 5, title: 'Great!', comment: 'Excellent quality frames.' });
    expect(review.status).toBe(201);
    expect(review.body.data.isVerifiedPurchase).toBe(true);

    // Product rating recomputed.
    const detail = await request(app).get(`/api/v1/products/${product.slug}`);
    expect(detail.body.data.numReviews).toBeGreaterThan(0);

    // Duplicate rejected.
    const dup = await request(app)
      .post(`/api/v1/products/${product.slug}/reviews`)
      .set(auth())
      .send({ rating: 4, comment: 'Trying to review twice.' });
    expect(dup.status).toBe(409);

    const mine = await request(app).get('/api/v1/account/reviews').set(auth());
    expect(mine.body.data.length).toBeGreaterThanOrEqual(1);

    const del = await request(app)
      .delete(`/api/v1/account/reviews/${review.body.data._id}`)
      .set(auth());
    expect(del.status).toBe(200);
  });

  it('creates a return for a delivered order and lists it', async () => {
    const products = await request(app).get('/api/v1/products?inStock=true&limit=1');
    const product = products.body.data[0];
    await request(app).post('/api/v1/cart/items').set(auth()).send({ productId: product._id, quantity: 1 });
    const order = await request(app)
      .post('/api/v1/orders')
      .set(auth())
      .send({ shippingAddress: address, paymentMethod: 'cod' });
    const { orderNumber } = order.body.data;

    // Not delivered yet → rejected.
    const early = await request(app)
      .post('/api/v1/account/returns')
      .set(auth())
      .send({ orderNumber, reason: 'Wrong size' });
    expect(early.status).toBe(400);

    // Mark delivered directly (admin status API arrives in Phase 8).
    await Order.updateOne({ orderNumber }, { status: 'delivered' });

    const created = await request(app)
      .post('/api/v1/account/returns')
      .set(auth())
      .send({ orderNumber, reason: 'Wrong size', type: 'return' });
    expect(created.status).toBe(201);
    expect(created.body.data.returnNumber).toMatch(/^RET-/);
    expect(created.body.data.refund.amount).toBeGreaterThan(0);

    const list = await request(app).get('/api/v1/account/returns').set(auth());
    expect(list.body.data.length).toBe(1);
  });

  it('receives notifications from order events and manages them', async () => {
    const products = await request(app).get('/api/v1/products?inStock=true&limit=1');
    const product = products.body.data[0];
    await request(app).post('/api/v1/cart/items').set(auth()).send({ productId: product._id, quantity: 1 });
    await request(app)
      .post('/api/v1/orders')
      .set(auth())
      .send({ shippingAddress: address, paymentMethod: 'cod' });

    // Event handlers run async — poll briefly until the notification lands.
    let list;
    for (let i = 0; i < 20; i += 1) {
      list = await request(app).get('/api/v1/account/notifications').set(auth());
      if (list.body.data.length > 0) break;
      await new Promise((r) => setTimeout(r, 100));
    }
    expect(list.status).toBe(200);
    expect(list.body.data.length).toBeGreaterThanOrEqual(1);
    expect(list.body.meta.unreadCount).toBeGreaterThanOrEqual(1);

    const first = list.body.data[0];
    const read = await request(app).patch(`/api/v1/account/notifications/${first._id}/read`).set(auth());
    expect(read.status).toBe(200);

    const all = await request(app).post('/api/v1/account/notifications/read-all').set(auth());
    expect(all.status).toBe(200);
    const after = await request(app).get('/api/v1/account/notifications').set(auth());
    expect(after.body.meta.unreadCount).toBe(0);
  });
});
