import { describe, it, expect } from '@jest/globals';
import { seedAll } from '../src/utils/seedData.js';
import { Product, Category, Brand, User, Coupon } from '../src/models/index.js';

describe('Seed dataset', () => {
  it('populates the catalog and generates slugs', async () => {
    const result = await seedAll();
    expect(result.products).toBeGreaterThanOrEqual(25);

    const [products, categories, brands, admin, coupon] = await Promise.all([
      Product.countDocuments(),
      Category.countDocuments(),
      Brand.countDocuments(),
      User.findOne({ role: 'admin' }),
      Coupon.findOne({ code: 'WELCOME10' }),
    ]);

    expect(products).toBe(result.products);
    expect(categories).toBe(6);
    expect(brands).toBe(6);
    expect(admin).toBeTruthy();
    expect(coupon).toBeTruthy();

    const sample = await Product.findOne();
    expect(sample.slug).toBeTruthy();
    expect(sample.discountPercent).toBeGreaterThan(0);
    expect(sample.inStock).toBe(true);
  });
});
