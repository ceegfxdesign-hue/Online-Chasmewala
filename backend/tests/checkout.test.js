import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { seedAll } from '../src/utils/seedData.js';
import { Cart, Product, User } from '../src/models/index.js';

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

  async function configureLenses() {
    const doc = await Product.findById(product._id);
    doc.lensOptions = [
      { type: 'with-power', label: 'With Power', requiresPrescription: true, price: 100 },
      { type: 'zero-power', label: 'Zero Power', requiresPrescription: false, price: 0 },
    ];
    doc.lensPackages = [
      {
        id: 'premium',
        name: 'Premium Lens',
        description: 'Clear and scratch resistant',
        badge: 'Popular',
        features: ['Anti-glare', 'Scratch resistant'],
        warrantyMonths: 12,
        price: 250,
        mrp: 400,
        tags: ['bestseller'],
        powerTypes: ['with-power'],
      },
      { id: 'clear', name: 'Clear Lens', price: 0, mrp: 0, powerTypes: ['zero-power'] },
    ];
    doc.lensPrescriptionFields = [
      {
        key: 'sph', label: 'SPH', min: -10, max: 10, step: 0.25,
        scope: 'per-eye', required: true, powerTypes: ['with-power'],
      },
    ];
    await doc.save();
  }

  async function configureFrameOnly() {
    const doc = await Product.findById(product._id);
    doc.lensOptions = [{
      type: 'frame-only', label: 'Frame Only', subtitle: 'No lenses', price: 0,
    }];
    doc.lensPackages = [{
      id: 'should-ignore', name: 'Should Ignore', price: 999, mrp: 1299, powerTypes: ['all'],
    }];
    doc.lensPrescriptionFields = [];
    await doc.save();
  }

  async function configureContactLens() {
    const doc = await Product.findById(product._id);
    doc.lensOptions = [];
    doc.lensPackages = [];
    doc.lensPrescriptionFields = [];
    doc.contactLens = {
      kind: 'color',
      powerModes: ['zero-power', 'with-power'],
      packOptions: [{
        label: 'Two lenses', units: 2,
        price: product.price + 100, mrp: product.mrp + 150,
      }],
      availableColors: [
        { name: 'Hazel', hex: '#8B6F47' },
        { name: 'Ocean Blue', hex: '#377D9B' },
      ],
      powerTypes: [
        { name: 'Spherical', min: -6, max: 6, step: 0.25 },
        { name: 'Cylindrical', min: -2, max: 0, step: 0.25 },
      ],
    };
    await doc.save();
  }

  const poweredSelection = (right = '-1.00', left = '-1.00') => ({
    productId: product._id,
    quantity: 1,
    lensOption: {
      type: 'with-power:premium', baseType: 'with-power', packageId: 'premium',
      label: 'Untrusted label', price: 9999,
    },
    prescription: {
      method: 'manual',
      values: { 'Right eye \u00b7 SPH': right, 'Left eye \u00b7 SPH': left },
    },
  });

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

  it('resolves lens package pricing and snapshots from the product configuration', async () => {
    await configureLenses();
    const res = await request(app)
      .post('/api/v1/cart/items')
      .set(auth())
      .send(poweredSelection());

    expect(res.status).toBe(200);
    expect(res.body.data.summary.subtotal).toBe(product.price + 350);
    expect(res.body.data.items[0].lensOption).toMatchObject({
      type: 'with-power:premium',
      baseType: 'with-power',
      powerTypeLabel: 'With Power',
      packageId: 'premium',
      packageName: 'Premium Lens',
      label: 'With Power \u00b7 Premium Lens',
      price: 350,
      mrp: 500,
      badge: 'Popular',
      features: ['Anti-glare', 'Scratch resistant'],
      warrantyMonths: 12,
      tags: ['bestseller'],
    });
    expect(res.body.data.items[0].prescription.values).toEqual({
      'Right eye \u00b7 SPH': '-1.00',
      'Left eye \u00b7 SPH': '-1.00',
    });
  });

  it('uses server-priced fallback packages and rejects package-less new lens selections', async () => {
    const priced = await request(app)
      .post('/api/v1/cart/items')
      .set(auth())
      .send({
        productId: product._id,
        lensOption: {
          type: 'single-vision:blu-screen', baseType: 'single-vision',
          packageId: 'blu-screen', price: 9999,
        },
        prescription: { method: 'manual', values: { Power: '-1.00' } },
      });
    expect(priced.status).toBe(200);
    expect(priced.body.data.items[0].lensOption).toMatchObject({
      powerTypeLabel: 'With Power',
      packageName: 'BLU Screen Protection',
      subtitle: 'Comfortable lenses for phones, laptops and other screens.',
      price: 250,
      mrp: 500,
      warrantyMonths: 12,
      tags: ['Bestsellers', 'Work friendly'],
    });

    const progressive = await request(app)
      .post('/api/v1/cart/items')
      .set(auth())
      .send({
        productId: product._id,
        lensOption: {
          type: 'progressive:anti-glare', baseType: 'progressive',
          packageId: 'anti-glare', price: 0,
        },
        prescription: { method: 'manual', values: { Power: '1.00' } },
      });
    expect(progressive.status).toBe(200);
    const progressiveLine = progressive.body.data.items.find(
      (item) => item.lensOption.baseType === 'progressive'
    );
    expect(progressiveLine.lensOption).toMatchObject({
      powerTypeLabel: 'Progressive / Bifocals',
      packageName: 'Anti-Glare Premium',
      subtitle: 'Clear everyday lenses with dependable protection.',
      price: 1200,
      mrp: 1200,
      warrantyMonths: 6,
      tags: ['Bestsellers'],
    });

    const packageLess = await request(app)
      .post('/api/v1/cart/items')
      .set(auth())
      .send({
        productId: product._id,
        lensOption: { type: 'zero-power', baseType: 'zero-power', price: 0 },
      });
    expect(packageLess.status).toBe(400);
    expect(packageLess.body.message).toMatch(/lens package/i);
  });

  it('allows a configured frame-only mode without a package and returns a base snapshot', async () => {
    await configureFrameOnly();
    const res = await request(app)
      .post('/api/v1/cart/items')
      .set(auth())
      .send({
        productId: product._id,
        lensOption: { type: 'frame-only', baseType: 'frame-only' },
      });

    expect(res.status).toBe(200);
    expect(res.body.data.items[0].lensOption).toMatchObject({
      type: 'frame-only',
      baseType: 'frame-only',
      powerTypeLabel: 'Frame Only',
      label: 'Frame Only',
      subtitle: 'No lenses',
      price: 0,
      mrp: 0,
    });
    expect(res.body.data.items[0].lensOption.packageId).toBeUndefined();
    expect(res.body.data.items[0].prescription).toBeUndefined();

    const withUntrustedPackage = await request(app)
      .post('/api/v1/cart/items')
      .set(auth())
      .send({
        productId: product._id,
        lensOption: {
          type: 'frame-only:should-ignore', baseType: 'frame-only',
          packageId: 'should-ignore', price: 999,
        },
      });
    expect(withUntrustedPackage.status).toBe(200);
    expect(withUntrustedPackage.body.data.items).toHaveLength(1);
    expect(withUntrustedPackage.body.data.items[0]).toMatchObject({
      quantity: 2,
      lensOption: { type: 'frame-only', baseType: 'frame-only', price: 0, mrp: 0 },
    });
    expect(withUntrustedPackage.body.data.items[0].lensOption.packageId).toBeUndefined();
  });

  it('preserves legacy manual eye values and canonically merges the same new selection', async () => {
    const user = await User.findOne({ email: 'demo@onlinechasmewala.com' });
    await Cart.create({
      user: user._id,
      items: [{
        product: product._id,
        quantity: 1,
        price: product.price,
        lensOption: { type: 'single-vision:anti-glare', label: 'Old lens', price: 0 },
        prescription: {
          method: 'manual',
          rightEye: { sph: '-1.00' },
          leftEye: { sph: '-1.25' },
          pd: '62',
        },
      }],
    });

    const merged = await request(app)
      .post('/api/v1/cart/items')
      .set(auth())
      .send({
        productId: product._id,
        lensOption: {
          type: 'single-vision:anti-glare', baseType: 'single-vision', packageId: 'anti-glare',
        },
        prescription: {
          method: 'manual',
          values: {
            'Right eye \u00b7 SPH': '-1.00',
            'Left eye \u00b7 SPH': '-1.25',
            PD: '62',
          },
        },
      });

    expect(merged.status).toBe(200);
    expect(merged.body.data.items).toHaveLength(1);
    expect(merged.body.data.items[0].quantity).toBe(2);
    expect(merged.body.data.items[0].prescription.values).toEqual({
      'Right eye \u00b7 SPH': '-1.00',
      'Left eye \u00b7 SPH': '-1.25',
      PD: '62',
    });
  });

  it('validates powered contact values and snapshots the server-resolved colour in the order', async () => {
    await configureContactLens();
    const selection = {
      productId: product._id,
      lensOption: {
        type: 'contact-color-with-power-0-1', packageId: 'contact-0',
        colour: 'Untrusted colour', price: 9999,
      },
      prescription: {
        method: 'manual',
        values: {
          'Spherical:Right eye': '-1.00',
          'Cylindrical:Right eye': '-0.50',
        },
      },
    };
    const added = await request(app).post('/api/v1/cart/items').set(auth()).send(selection);
    expect(added.status).toBe(200);
    expect(added.body.data.items[0].lensOption).toMatchObject({
      baseType: 'with-power',
      packageId: 'contact-0',
      packageName: 'Two lenses',
      colour: 'Ocean Blue',
      price: 100,
    });

    const order = await request(app)
      .post('/api/v1/orders')
      .set(auth())
      .send({ shippingAddress: address, paymentMethod: 'cod' });
    expect(order.status).toBe(201);
    expect(order.body.data.items[0].lensOption.colour).toBe('Ocean Blue');
    expect(order.body.data.items[0].prescription.values).toEqual(selection.prescription.values);
  });

  it('rejects invalid contact colours, incomplete eyes, ranges, and increments', async () => {
    await configureContactLens();
    const requestSelection = (type, values) => request(app)
      .post('/api/v1/cart/items')
      .set(auth())
      .send({
        productId: product._id,
        lensOption: { type, packageId: 'contact-0' },
        prescription: { method: 'manual', values },
      });
    const complete = {
      'Spherical:Right eye': '-1.00',
      'Cylindrical:Right eye': '-0.50',
    };

    const badColour = await requestSelection('contact-color-with-power-0-9', complete);
    expect(badColour.status).toBe(400);
    expect(badColour.body.message).toMatch(/colour/i);

    const wrongKind = await requestSelection('contact-clear-with-power-0-0', complete);
    expect(wrongKind.status).toBe(400);
    expect(wrongKind.body.message).toMatch(/product type/i);

    const incomplete = await requestSelection(
      'contact-color-with-power-0-0',
      { 'Spherical:Right eye': '-1.00' }
    );
    expect(incomplete.status).toBe(400);
    expect(incomplete.body.message).toMatch(/every configured power value/i);

    const partialSecondEye = await requestSelection(
      'contact-color-with-power-0-0',
      { ...complete, 'Spherical:Left eye': '-1.00' }
    );
    expect(partialSecondEye.status).toBe(400);
    expect(partialSecondEye.body.message).toMatch(/every configured power value for Left eye/i);

    const outsideRange = await requestSelection(
      'contact-color-with-power-0-0',
      { ...complete, 'Spherical:Right eye': '7.00' }
    );
    expect(outsideRange.status).toBe(400);
    expect(outsideRange.body.message).toMatch(/between -6 and 6/i);

    const wrongStep = await requestSelection(
      'contact-color-with-power-0-0',
      { ...complete, 'Spherical:Right eye': '-1.10' }
    );
    expect(wrongStep.status).toBe(400);
    expect(wrongStep.body.message).toMatch(/increments of 0.25/i);
  });

  it('canonicalizes stale powered solution configuration to zero-power without a prescription', async () => {
    const doc = await Product.findById(product._id);
    doc.contactLens = {
      kind: 'solution',
      // Simulates an older record created before non-lens kinds were forced to
      // zero-power by the admin editor.
      powerModes: ['with-power'],
      powerTypes: [{ name: 'Spherical', min: -3, max: 3, step: 0.25 }],
      packOptions: [{ label: '60 ml', price: product.price, mrp: product.mrp }],
    };
    await doc.save();

    const added = await request(app)
      .post('/api/v1/cart/items')
      .set(auth())
      .send({
        productId: product._id,
        lensOption: { type: 'contact-solution-with-power-0-0', packageId: 'contact-0' },
        prescription: { method: 'manual', values: {} },
      });

    expect(added.status).toBe(200);
    expect(added.body.data.items[0].lensOption).toMatchObject({
      type: 'contact-solution-zero-power-0-0',
      baseType: 'zero-power',
      powerTypeLabel: 'Solution',
      packageName: '60 ml',
    });
    expect(added.body.data.items[0].prescription).toBeUndefined();
  });

  it('rejects incompatible packages and incomplete configured prescriptions', async () => {
    await configureLenses();
    const incomplete = poweredSelection();
    delete incomplete.prescription.values['Left eye \u00b7 SPH'];
    const missing = await request(app).post('/api/v1/cart/items').set(auth()).send(incomplete);
    expect(missing.status).toBe(400);
    expect(missing.body.message).toMatch(/Left eye.*required/i);

    const incompatible = await request(app)
      .post('/api/v1/cart/items')
      .set(auth())
      .send({
        productId: product._id,
        lensOption: { type: 'zero-power:premium', baseType: 'zero-power', packageId: 'premium' },
      });
    expect(incompatible.status).toBe(400);
    expect(incompatible.body.message).toMatch(/not available/i);
  });

  it('preserves merged prescriptions and keeps different powers on separate cart lines', async () => {
    await configureLenses();
    const first = poweredSelection('-1.00', '-1.25');
    const second = poweredSelection('-2.00', '-2.25');
    const merged = await request(app)
      .post('/api/v1/cart/merge')
      .set(auth())
      .send({ items: [first, first, second] });

    expect(merged.status).toBe(200);
    expect(merged.body.data.items).toHaveLength(2);
    expect(merged.body.data.items.map((item) => item.quantity).sort()).toEqual([1, 2]);
    expect(merged.body.data.items.map((item) => item.prescription.values['Right eye \u00b7 SPH']).sort())
      .toEqual(['-1.00', '-2.00']);
  });

  it('copies the complete lens and manual prescription snapshots into an order', async () => {
    await configureLenses();
    await request(app).post('/api/v1/cart/items').set(auth()).send(poweredSelection('-1.50', '-1.75'));
    const order = await request(app)
      .post('/api/v1/orders')
      .set(auth())
      .send({ shippingAddress: address, paymentMethod: 'cod' });

    expect(order.status).toBe(201);
    expect(order.body.data.items[0].lensOption).toMatchObject({
      baseType: 'with-power', packageId: 'premium', packageName: 'Premium Lens', price: 350,
    });
    expect(order.body.data.items[0].prescription).toEqual({
      method: 'manual',
      values: { 'Right eye \u00b7 SPH': '-1.50', 'Left eye \u00b7 SPH': '-1.75' },
    });
  });

  it('copies an uploaded prescription into the cart and order snapshots', async () => {
    await configureLenses();
    const selection = poweredSelection();
    selection.prescription = {
      method: 'upload',
      fileName: 'eye-power.pdf',
      mimeType: 'application/pdf',
      fileData: 'data:application/pdf;base64,aGVsbG8=',
    };

    const added = await request(app).post('/api/v1/cart/items').set(auth()).send(selection);
    expect(added.status).toBe(200);
    expect(added.body.data.items[0].prescription).toEqual(selection.prescription);

    const order = await request(app)
      .post('/api/v1/orders')
      .set(auth())
      .send({ shippingAddress: address, paymentMethod: 'cod' });
    expect(order.status).toBe(201);
    expect(order.body.data.items[0].prescription).toEqual(selection.prescription);
  });

  it('rejects unsafe or malformed prescription uploads', async () => {
    await configureLenses();
    const selection = poweredSelection();
    selection.prescription = {
      method: 'upload',
      fileName: 'prescription.svg',
      mimeType: 'image/svg+xml',
      fileData: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=',
    };
    const unsafe = await request(app).post('/api/v1/cart/items').set(auth()).send(selection);
    expect(unsafe.status).toBe(422);

    selection.prescription = {
      method: 'upload',
      fileName: 'eye-power.pdf',
      mimeType: 'application/pdf',
      fileData: 'not-a-data-url',
    };
    const malformed = await request(app).post('/api/v1/cart/items').set(auth()).send(selection);
    expect(malformed.status).toBe(422);
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
