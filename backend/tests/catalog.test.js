import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { seedAll } from '../src/utils/seedData.js';

const app = createApp();

async function adminToken() {
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'admin@onlinechasmewala.com', password: 'Admin@123' });
  return res.body.data.accessToken;
}

describe('Catalog API', () => {
  beforeEach(async () => {
    await seedAll();
  });

  it('lists products with pagination meta', async () => {
    const res = await request(app).get('/api/v1/products?limit=8');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(8);
    expect(res.body.meta.total).toBeGreaterThanOrEqual(25);
    expect(res.body.meta.totalPages).toBeGreaterThan(1);
  });

  it('filters by category slug', async () => {
    const res = await request(app).get('/api/v1/products?category=sunglasses');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    res.body.data.forEach((p) => expect(p.category.slug).toBe('sunglasses'));
  });

  it('includes unisex products in men and women catalog filters', async () => {
    const [men, women] = await Promise.all([
      request(app).get('/api/v1/products?gender=men&limit=60'),
      request(app).get('/api/v1/products?gender=women&limit=60'),
    ]);

    [men, women].forEach((res) => {
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      res.body.data.forEach((product) => {
        expect(['men', 'women', 'unisex']).toContain(product.gender);
      });
    });

    expect(men.body.data.some((product) => product.gender === 'unisex')).toBe(true);
    expect(women.body.data.some((product) => product.gender === 'unisex')).toBe(true);
    expect(men.body.data.every((product) => ['men', 'unisex'].includes(product.gender))).toBe(true);
    expect(women.body.data.every((product) => ['women', 'unisex'].includes(product.gender))).toBe(true);
  });

  it('filters by price range and sorts ascending', async () => {
    const res = await request(app).get('/api/v1/products?maxPrice=1000&sort=price-asc');
    expect(res.status).toBe(200);
    const prices = res.body.data.map((p) => p.price);
    prices.forEach((p) => expect(p).toBeLessThanOrEqual(1000));
    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sorted);
  });

  it('performs a text search', async () => {
    const res = await request(app).get('/api/v1/products?search=aviator');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('returns filter facets', async () => {
    const res = await request(app).get('/api/v1/products/facets');
    expect(res.status).toBe(200);
    expect(res.body.data.brands.length).toBeGreaterThan(0);
    expect(res.body.data.price.max).toBeGreaterThan(res.body.data.price.min);
  });

  it('returns home collections', async () => {
    const res = await request(app).get('/api/v1/products/collections');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('bestSellers');
    expect(res.body.data.bestSellers.length).toBeGreaterThan(0);
  });

  it('returns instant-search suggestions', async () => {
    const res = await request(app).get('/api/v1/products/suggest?q=nova');
    expect(res.status).toBe(200);
    expect(res.body.data.products.length).toBeGreaterThan(0);
  });

  it('fetches a product by slug with related products', async () => {
    const list = await request(app).get('/api/v1/products?limit=1');
    const { slug } = list.body.data[0];
    const detail = await request(app).get(`/api/v1/products/${slug}`);
    expect(detail.status).toBe(200);
    expect(detail.body.data.slug).toBe(slug);
    const related = await request(app).get(`/api/v1/products/${slug}/related`);
    expect(related.status).toBe(200);
    expect(Array.isArray(related.body.data)).toBe(true);
  });

  it('lists categories with product counts', async () => {
    const res = await request(app).get('/api/v1/categories');
    expect(res.status).toBe(200);
    const sun = res.body.data.find((c) => c.slug === 'sunglasses');
    expect(sun.productCount).toBeGreaterThan(0);
  });

  it('lists currently active seasonal offers', async () => {
    const res = await request(app).get('/api/v1/offers');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('ctaLink');
  });

  it('returns product reviews and a rating summary', async () => {
    const list = await request(app).get('/api/v1/products?limit=1');
    const { slug } = list.body.data[0];
    const reviews = await request(app).get(`/api/v1/products/${slug}/reviews`);
    expect(reviews.status).toBe(200);
    expect(Array.isArray(reviews.body.data)).toBe(true);
    const summary = await request(app).get(`/api/v1/products/${slug}/reviews/summary`);
    expect(summary.status).toBe(200);
    expect(summary.body.data).toHaveProperty('distribution');
  });
});

describe('Catalog admin CRUD', () => {
  beforeEach(async () => {
    await seedAll();
  });

  it('rejects product creation without admin auth', async () => {
    const res = await request(app).post('/api/v1/products').send({ name: 'x' });
    expect(res.status).toBe(401);
  });

  it('allows an admin to create, update and delete a product', async () => {
    const token = await adminToken();
    const cats = await request(app).get('/api/v1/categories');
    const brands = await request(app).get('/api/v1/brands');
    const categoryId = cats.body.data[0]._id;
    const brandId = brands.body.data[0]._id;

    const created = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Frame X',
        sku: 'TESTX1',
        description: 'A great test frame for unit tests.',
        price: 1000,
        mrp: 2000,
        category: categoryId,
        brand: brandId,
        images: ['https://example.com/x.jpg'],
        frameColor: 'Crystal Clear',
        frameSize: 'wide',
        rimType: 'full-rim',
        lensThickness: '1.56 index',
        powered: true,
        genders: ['men', 'women'],
        lensOptions: [{ type: 'zero-power', label: 'Zero Power', subtitle: 'Screen glasses', price: 0 }],
      });
    expect(created.status).toBe(201);
    expect(created.body.data.discountPercent).toBe(50);
    expect(created.body.data.frameSize).toBe('wide');
    expect(created.body.data.genders).toEqual(['men', 'women']);
    expect(created.body.data.gender).toBe('men');
    expect(created.body.data.lensOptions).toHaveLength(1);
    const id = created.body.data._id;

    const womenCatalog = await request(app).get('/api/v1/products?gender=women&limit=60');
    expect(womenCatalog.status).toBe(200);
    expect(womenCatalog.body.data.some((product) => product._id === id)).toBe(true);

    const updated = await request(app)
      .patch(`/api/v1/products/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ price: 1500, frameSize: 'medium', powered: false });
    expect(updated.status).toBe(200);
    expect(updated.body.data.discountPercent).toBe(25);
    expect(updated.body.data.frameSize).toBe('medium');
    expect(updated.body.data.powered).toBe(false);

    const removed = await request(app)
      .delete(`/api/v1/products/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(removed.status).toBe(200);
  });

  it('persists replacement product and colour-variant images with fresh media references', async () => {
    const token = await adminToken();
    const [cats, brands] = await Promise.all([
      request(app).get('/api/v1/categories'),
      request(app).get('/api/v1/brands'),
    ]);
    const inlineImage = (value) =>
      `data:image/png;base64,${Buffer.from(value).toString('base64')}`;
    const mediaPath = (reference) => {
      const main = reference.match(/^oc-product-image:\/\/([^/]+)\/(\d+)$/);
      if (main) return `/api/v1/products/media/${main[1]}/${main[2]}`;
      const variant = reference.match(/^oc-product-variant-image:\/\/([^/]+)\/(\d+)\/(\d+)$/);
      return `/api/v1/products/media/${variant[1]}/variant/${variant[2]}/${variant[3]}`;
    };

    const created = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Editable Image Frame',
        sku: 'EDIT-IMAGE-1',
        description: 'A frame used to verify image replacement behavior.',
        price: 1200,
        mrp: 1800,
        category: cats.body.data[0]._id,
        brand: brands.body.data[0]._id,
        images: [inlineImage('original-main-image')],
        variants: [{ color: 'Black', images: [inlineImage('original-variant-image')] }],
      });

    expect(created.status).toBe(201);
    const id = created.body.data._id;
    const originalMainReference = created.body.data.images[0];
    const originalVariantReference = created.body.data.variants[0].images[0];
    expect(originalMainReference).toMatch(
      new RegExp(`^oc-product-image://${id}@[a-f0-9]{12}/0$`)
    );
    expect(originalVariantReference).toMatch(
      new RegExp(`^oc-product-variant-image://${id}@[a-f0-9]{12}/0/0$`)
    );

    const preserved = await request(app)
      .patch(`/api/v1/products/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        images: [originalMainReference],
        variants: [{ color: 'Black', images: [originalVariantReference] }],
      });
    expect(preserved.status).toBe(200);
    expect(preserved.body.data.images[0]).toBe(originalMainReference);
    expect(preserved.body.data.variants[0].images[0]).toBe(originalVariantReference);

    const updated = await request(app)
      .patch(`/api/v1/products/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        images: [inlineImage('replacement-main-image')],
        variants: [{ color: 'Black', images: [inlineImage('replacement-variant-image')] }],
      });

    expect(updated.status).toBe(200);
    const replacementMainReference = updated.body.data.images[0];
    const replacementVariantReference = updated.body.data.variants[0].images[0];
    expect(replacementMainReference).not.toBe(originalMainReference);
    expect(replacementVariantReference).not.toBe(originalVariantReference);

    const [mainImage, variantImage, staleMainImage] = await Promise.all([
      request(app).get(mediaPath(replacementMainReference)),
      request(app).get(mediaPath(replacementVariantReference)),
      request(app).get(mediaPath(originalMainReference)),
    ]);
    expect(mainImage.status).toBe(200);
    expect(mainImage.body.toString()).toBe('replacement-main-image');
    expect(variantImage.status).toBe(200);
    expect(variantImage.body.toString()).toBe('replacement-variant-image');
    expect(staleMainImage.status).toBe(404);
  });

  it('accepts a compressed multi-image product payload larger than one megabyte', async () => {
    const token = await adminToken();
    const [cats, brands] = await Promise.all([
      request(app).get('/api/v1/categories'),
      request(app).get('/api/v1/brands'),
    ]);
    const largeInlineImage = (character) =>
      `data:image/jpeg;base64,${character.repeat(600000)}`;

    const created = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Large Gallery Frame',
        sku: 'LARGE-GALLERY-1',
        description: 'A frame used to verify compressed gallery request sizes.',
        price: 1200,
        mrp: 1800,
        category: cats.body.data[0]._id,
        brand: brands.body.data[0]._id,
        images: [largeInlineImage('a'), largeInlineImage('b')],
      });

    expect(created.status).toBe(201);
    expect(created.body.data.images).toHaveLength(2);
    created.body.data.images.forEach((image) => {
      expect(image).toMatch(/^oc-product-image:\/\/[0-9a-f]{24}@[a-f0-9]{12}\/\d+$/);
    });
  });
});
