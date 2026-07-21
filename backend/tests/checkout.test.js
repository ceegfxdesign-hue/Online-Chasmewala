import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { seedAll } from '../src/utils/seedData.js';

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

const address = {
  fullName: 'Demo Customer',
  phone: '9000000000',
  line1: '12 MG Road',
  city: 'Bengaluru',
  state: 'Karnataka',
  pincode: '560001',
};

describe('Cart & checkout flow', () => {
  let token;
  let product;

  beforeEach(async () => {
    await seedAll();
    token = await demoToken();
    product = await firstInStockProduct();
  });

  const auth = () => ({ Authorization: `Bearer ${token}` });

  it('requires auth for the cart', async () => {
    const res = await request(app).get('/api/v1/cart');
    expect(res.status).toBe(401);
  });

  it('adds items and computes a subtotal from live prices', async () => {
    const res = await request(app)
      .post('/api/v1/cart/items')
      .set(auth())
      .send({ productId: product._id, quantity: 2 });
    expect(res.status).toBe(200);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.summary.subtotal).toBe(product.price * 2);
    expect(res.body.data.summary.itemCount).toBe(2);
  });

  it('updates and removes cart items', async () => {
    await request(app).post('/api/v1/cart/items').set(auth()).send({ productId: product._id, quantity: 1 });
    let cart = (await request(app).get('/api/v1/cart').set(auth())).body.data;
    const itemId = cart.items[0]._id;

    const updated = await request(app).patch(`/api/v1/cart/items/${itemId}`).set(auth()).send({ quantity: 3 });
    expect(updated.body.data.items[0].quantity).toBe(3);

    const removed = await request(app).delete(`/api/v1/cart/items/${itemId}`).set(auth());
    expect(removed.body.data.items).toHaveLength(0);
  });

  it('validates a coupon against the subtotal', async () => {
    // WELCOME10 needs a min order of ₹999.
    await request(app).post('/api/v1/cart/items').set(auth()).send({ productId: product._id, quantity: 2 });
    const cart = (await request(app).get('/api/v1/cart').set(auth())).body.data;

    const ok = await request(app)
      .post('/api/v1/coupons/validate')
      .set(auth())
      .send({ code: 'WELCOME10', subtotal: cart.summary.subtotal });
    expect(ok.status).toBe(200);
    expect(ok.body.data.discount).toBeGreaterThan(0);

    const bad = await request(app)
      .post('/api/v1/coupons/validate')
      .set(auth())
      .send({ code: 'NOPE', subtotal: cart.summary.subtotal });
    expect(bad.status).toBe(400);
  });

  it('quotes an order with shipping and discount', async () => {
    await request(app).post('/api/v1/cart/items').set(auth()).send({ productId: product._id, quantity: 2 });
    const quote = await request(app)
      .post('/api/v1/orders/quote')
      .set(auth())
      .send({ couponCode: 'WELCOME10', deliveryMethod: 'standard' });
    expect(quote.status).toBe(200);
    expect(quote.body.data.pricing.total).toBeGreaterThan(0);
    expect(quote.body.data.pricing.discount).toBeGreaterThan(0);
  });

  it('places an order (mock payment), decrements stock and clears the cart', async () => {
    await request(app).post('/api/v1/cart/items').set(auth()).send({ productId: product._id, quantity: 2 });

    const order = await request(app)
      .post('/api/v1/orders')
      .set(auth())
      .send({ shippingAddress: address, paymentMethod: 'card', paymentToken: 'tok_ok', deliveryMethod: 'standard' });
    expect(order.status).toBe(201);
    expect(order.body.data.orderNumber).toMatch(/^OC-/);
    expect(order.body.data.status).toBe('confirmed');
    expect(order.body.data.payment.status).toBe('paid');

    // Cart is cleared.
    const cart = await request(app).get('/api/v1/cart').set(auth());
    expect(cart.body.data.items).toHaveLength(0);

    // Stock decremented.
    const after = await request(app).get(`/api/v1/products/${product.slug}`);
    expect(after.body.data.stock).toBe(product.stock - 2);

    // Appears in my orders.
    const mine = await request(app).get('/api/v1/orders').set(auth());
    expect(mine.body.data.length).toBe(1);
  });

  it('fails the order when payment is declined (tok_fail)', async () => {
    await request(app).post('/api/v1/cart/items').set(auth()).send({ productId: product._id, quantity: 1 });
    const order = await request(app)
      .post('/api/v1/orders')
      .set(auth())
      .send({ shippingAddress: address, paymentMethod: 'card', paymentToken: 'tok_fail' });
    expect(order.status).toBe(402);
    // Cart is preserved so the user can retry.
    const cart = await request(app).get('/api/v1/cart').set(auth());
    expect(cart.body.data.items.length).toBe(1);
  });

  it('supports COD and allows cancellation with restock', async () => {
    await request(app).post('/api/v1/cart/items').set(auth()).send({ productId: product._id, quantity: 1 });
    const order = await request(app)
      .post('/api/v1/orders')
      .set(auth())
      .send({ shippingAddress: address, paymentMethod: 'cod' });
    expect(order.status).toBe(201);
    const { orderNumber } = order.body.data;

    const cancelled = await request(app)
      .post(`/api/v1/orders/${orderNumber}/cancel`)
      .set(auth())
      .send({ reason: 'Changed my mind' });
    expect(cancelled.status).toBe(200);
    expect(cancelled.body.data.status).toBe('cancelled');

    const after = await request(app).get(`/api/v1/products/${product.slug}`);
    expect(after.body.data.stock).toBe(product.stock);
  });

  it('toggles the wishlist', async () => {
    const add = await request(app).post('/api/v1/wishlist/toggle').set(auth()).send({ productId: product._id });
    expect(add.body.data.added).toBe(true);
    expect(add.body.data.items.length).toBe(1);

    const remove = await request(app).post('/api/v1/wishlist/toggle').set(auth()).send({ productId: product._id });
    expect(remove.body.data.added).toBe(false);
  });
});
