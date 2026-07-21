/**
 * Seed dataset for Online Chasmewala. Generates a realistic demo catalog so the
 * storefront is fully populated on first run. Idempotent: destroyAll() clears
 * seeded collections, seedAll() rebuilds them.
 */
import {
  User,
  Category,
  Brand,
  Product,
  Offer,
  Banner,
  Coupon,
  Review,
  Settings,
} from '../models/index.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

const img = (seed) => `https://picsum.photos/seed/${seed}/900/900`;

const CATEGORIES = [
  { name: 'Eyeglasses', description: 'Prescription-ready frames for everyday clarity.', isFeatured: true, order: 1, icon: 'eyeglasses' },
  { name: 'Sunglasses', description: 'UV-protected styles for every face.', isFeatured: true, order: 2, icon: 'sunglasses' },
  { name: 'Computer Glasses', description: 'Blue-light filtering for screen time.', isFeatured: true, order: 3, icon: 'computer' },
  { name: 'Contact Lenses', description: 'Daily and monthly lenses.', isFeatured: true, order: 4, icon: 'lens' },
  { name: 'Kids Glasses', description: 'Durable, playful frames for little eyes.', isFeatured: true, order: 5, icon: 'kids' },
  { name: 'Accessories', description: 'Cases, cleaners and cords.', isFeatured: false, order: 6, icon: 'accessory' },
];

const BRANDS = [
  { name: 'Chasme Aura', isFeatured: true, description: 'House label — modern acetate frames.' },
  { name: 'Vision Nova', isFeatured: true, description: 'Lightweight titanium engineering.' },
  { name: 'UrbanOptic', isFeatured: true, description: 'Street-ready statement eyewear.' },
  { name: 'Lumen', isFeatured: true, description: 'Minimalist rimless designs.' },
  { name: 'SolarShade', isFeatured: true, description: 'Polarized performance sunglasses.' },
  { name: 'ClearKids', isFeatured: false, description: 'Flexible frames built for play.' },
];

const FRAME_COLORS = [
  { color: 'Matte Black', colorHex: '#111827' },
  { color: 'Tortoise', colorHex: '#7c4a1e' },
  { color: 'Crystal Blue', colorHex: '#3b82f6' },
  { color: 'Gunmetal', colorHex: '#4b5563' },
  { color: 'Rose Gold', colorHex: '#b76e79' },
  { color: 'Transparent', colorHex: '#d1d5db' },
];

// Product blueprints per category. The generator expands these into variants.
const BLUEPRINTS = [
  // Eyeglasses
  { cat: 'Eyeglasses', brand: 'Chasme Aura', name: 'Aura Rectangle', shape: 'rectangle', type: 'full-rim', material: 'acetate', gender: 'unisex', price: 1299, mrp: 2499, faces: ['oval', 'round', 'heart'], flags: { isBestSeller: true } },
  { cat: 'Eyeglasses', brand: 'Vision Nova', name: 'Nova Round Titanium', shape: 'round', type: 'full-rim', material: 'titanium', gender: 'unisex', price: 2199, mrp: 3999, faces: ['square', 'oblong'], flags: { isTrending: true } },
  { cat: 'Eyeglasses', brand: 'Lumen', name: 'Lumen Rimless Air', shape: 'oval', type: 'rimless', material: 'titanium', gender: 'unisex', price: 2599, mrp: 4599, faces: ['oval', 'square'], flags: { isFeatured: true } },
  { cat: 'Eyeglasses', brand: 'UrbanOptic', name: 'Urban Cat-Eye', shape: 'cat-eye', type: 'full-rim', material: 'acetate', gender: 'women', price: 1499, mrp: 2799, faces: ['heart', 'diamond'], flags: { isNewArrival: true } },
  { cat: 'Eyeglasses', brand: 'Chasme Aura', name: 'Aura Square Bold', shape: 'square', type: 'full-rim', material: 'tr90', gender: 'men', price: 1199, mrp: 2299, faces: ['round', 'oval'], flags: {} },
  { cat: 'Eyeglasses', brand: 'Vision Nova', name: 'Nova Geometric', shape: 'geometric', type: 'half-rim', material: 'metal', gender: 'unisex', price: 1699, mrp: 2999, faces: ['oval', 'square'], flags: { isBestSeller: true } },
  { cat: 'Eyeglasses', brand: 'Lumen', name: 'Lumen Wayfarer Classic', shape: 'wayfarer', type: 'full-rim', material: 'acetate', gender: 'unisex', price: 1399, mrp: 2599, faces: ['round', 'oval', 'heart'], flags: { isTrending: true } },
  { cat: 'Eyeglasses', brand: 'UrbanOptic', name: 'Urban Clubmaster', shape: 'clubmaster', type: 'half-rim', material: 'mixed', gender: 'men', price: 1599, mrp: 2899, faces: ['square', 'oblong'], flags: {} },

  // Sunglasses
  { cat: 'Sunglasses', brand: 'SolarShade', name: 'Solar Aviator Pro', shape: 'aviator', type: 'full-rim', material: 'metal', gender: 'unisex', price: 1899, mrp: 3499, faces: ['square', 'heart'], sun: true, polarized: true, flags: { isBestSeller: true } },
  { cat: 'Sunglasses', brand: 'SolarShade', name: 'Solar Wayfarer Polarized', shape: 'wayfarer', type: 'full-rim', material: 'acetate', gender: 'unisex', price: 1699, mrp: 3199, faces: ['round', 'oval'], sun: true, polarized: true, flags: { isTrending: true } },
  { cat: 'Sunglasses', brand: 'UrbanOptic', name: 'Urban Cat-Eye Shades', shape: 'cat-eye', type: 'full-rim', material: 'acetate', gender: 'women', price: 1799, mrp: 3299, faces: ['heart', 'diamond'], sun: true, flags: { isNewArrival: true } },
  { cat: 'Sunglasses', brand: 'Vision Nova', name: 'Nova Round Sun', shape: 'round', type: 'full-rim', material: 'metal', gender: 'unisex', price: 1499, mrp: 2799, faces: ['square', 'oblong'], sun: true, flags: {} },
  { cat: 'Sunglasses', brand: 'SolarShade', name: 'Solar Sport Wrap', shape: 'geometric', type: 'half-rim', material: 'tr90', gender: 'men', price: 2099, mrp: 3799, faces: ['oval', 'square'], sun: true, polarized: true, flags: { isFeatured: true } },
  { cat: 'Sunglasses', brand: 'Chasme Aura', name: 'Aura Oversized', shape: 'square', type: 'full-rim', material: 'acetate', gender: 'women', price: 1599, mrp: 2999, faces: ['oval', 'heart'], sun: true, flags: {} },

  // Computer glasses
  { cat: 'Computer Glasses', brand: 'Vision Nova', name: 'Nova Screen Guard', shape: 'rectangle', type: 'full-rim', material: 'tr90', gender: 'unisex', price: 999, mrp: 1999, faces: ['oval', 'round'], blue: true, flags: { isBestSeller: true } },
  { cat: 'Computer Glasses', brand: 'Chasme Aura', name: 'Aura Blu Round', shape: 'round', type: 'full-rim', material: 'acetate', gender: 'unisex', price: 1099, mrp: 2099, faces: ['square', 'oblong'], blue: true, flags: { isTrending: true } },
  { cat: 'Computer Glasses', brand: 'Lumen', name: 'Lumen Blu Rimless', shape: 'oval', type: 'rimless', material: 'titanium', gender: 'unisex', price: 1799, mrp: 3299, faces: ['oval', 'square'], blue: true, flags: { isFeatured: true } },
  { cat: 'Computer Glasses', brand: 'UrbanOptic', name: 'Urban Blu Square', shape: 'square', type: 'half-rim', material: 'metal', gender: 'men', price: 1199, mrp: 2299, faces: ['round', 'oval'], blue: true, flags: {} },

  // Kids
  { cat: 'Kids Glasses', brand: 'ClearKids', name: 'ClearKids Flex Round', shape: 'round', type: 'full-rim', material: 'tr90', gender: 'kids', price: 899, mrp: 1699, faces: ['round', 'oval'], blue: true, flags: { isBestSeller: true } },
  { cat: 'Kids Glasses', brand: 'ClearKids', name: 'ClearKids Bright Square', shape: 'square', type: 'full-rim', material: 'tr90', gender: 'kids', price: 949, mrp: 1799, faces: ['round'], flags: { isNewArrival: true } },
  { cat: 'Kids Glasses', brand: 'ClearKids', name: 'ClearKids Play Wayfarer', shape: 'wayfarer', type: 'full-rim', material: 'plastic', gender: 'kids', price: 799, mrp: 1499, faces: ['oval', 'heart'], flags: {} },

  // Contact lenses
  { cat: 'Contact Lenses', brand: 'Vision Nova', name: 'Nova Daily Clear (30 pack)', shape: null, type: null, material: null, gender: 'unisex', price: 699, mrp: 1099, faces: [], lens: 'zero-power', contact: true, flags: { isBestSeller: true } },
  { cat: 'Contact Lenses', brand: 'Vision Nova', name: 'Nova Monthly Hydra (6 pack)', shape: null, type: null, material: null, gender: 'unisex', price: 899, mrp: 1499, faces: [], lens: 'zero-power', contact: true, flags: { isTrending: true } },
  { cat: 'Contact Lenses', brand: 'Lumen', name: 'Lumen Color Hazel (2 pack)', shape: null, type: null, material: null, gender: 'unisex', price: 1099, mrp: 1899, faces: [], lens: 'zero-power', contact: true, flags: { isNewArrival: true } },

  // Accessories
  { cat: 'Accessories', brand: 'Chasme Aura', name: 'Premium Hard Case', shape: null, type: null, material: null, gender: 'unisex', price: 299, mrp: 599, faces: [], accessory: true, flags: {} },
  { cat: 'Accessories', brand: 'Chasme Aura', name: 'Lens Cleaning Kit', shape: null, type: null, material: null, gender: 'unisex', price: 249, mrp: 499, faces: [], accessory: true, flags: {} },
  { cat: 'Accessories', brand: 'UrbanOptic', name: 'Sport Retainer Cord', shape: null, type: null, material: null, gender: 'unisex', price: 199, mrp: 399, faces: [], accessory: true, flags: {} },
];

function buildProduct(bp, index, catMap, brandMap) {
  const seedBase = `oc-${index}`;
  const variants = FRAME_COLORS.slice(0, bp.contact || bp.accessory ? 1 : 3).map((c, vi) => ({
    color: c.color,
    colorHex: c.colorHex,
    images: [img(`${seedBase}-${vi}a`), img(`${seedBase}-${vi}b`)],
    stock: 15 + ((index * 7 + vi * 3) % 40),
    sku: `${bp.name.replace(/[^A-Za-z0-9]/g, '').slice(0, 8).toUpperCase()}-${vi + 1}`,
  }));
  const stock = variants.reduce((s, v) => s + v.stock, bp.accessory ? 60 : 0);

  return {
    name: bp.name,
    sku: `OC${String(1000 + index)}`,
    description: `${bp.name} by ${bp.brand}. ${
      bp.contact
        ? 'Comfortable, breathable lenses for all-day wear.'
        : bp.accessory
          ? 'A premium accessory to protect and care for your eyewear.'
          : `A ${bp.shape} ${bp.material} frame with a ${bp.type} silhouette — lightweight, durable and effortlessly stylish.`
    }`,
    highlights: bp.contact
      ? ['High oxygen permeability', 'UV blocking', 'Moisture-rich comfort']
      : bp.accessory
        ? ['Durable build', 'Compact & travel-friendly']
        : [
            `${bp.shape} shape`,
            `${bp.material} build`,
            bp.polarized ? 'Polarized lenses' : bp.blue ? 'Blue-light filter' : 'Anti-glare coating',
            `${bp.warranty || 12}-month warranty`,
          ],
    price: bp.price,
    mrp: bp.mrp,
    category: catMap[bp.cat],
    brand: brandMap[bp.brand],
    images: [img(`${seedBase}-main`), img(`${seedBase}-alt`), img(`${seedBase}-side`)],
    variants,
    gender: bp.gender,
    frameShape: bp.shape || undefined,
    frameType: bp.type || undefined,
    frameMaterial: bp.material || undefined,
    frameColor: variants[0]?.color,
    frameWidth: bp.contact || bp.accessory ? undefined : 138 + (index % 6),
    frameSize: 'medium',
    rimType: bp.type || undefined,
    templeSize: bp.contact || bp.accessory ? undefined : 140 + (index % 4),
    bridgeSize: bp.contact || bp.accessory ? undefined : 18 + (index % 3),
    lensWidth: bp.contact || bp.accessory ? undefined : 50 + (index % 5),
    lensType: bp.lens || (bp.sun ? 'sunglasses' : bp.blue ? 'blue-light' : 'single-vision'),
    suitableFaceShapes: bp.faces,
    blueLightFilter: Boolean(bp.blue),
    polarized: Boolean(bp.polarized),
    uvProtection: Boolean(bp.sun || bp.polarized),
    powered: !bp.contact && !bp.accessory,
    stock,
    rating: Math.round((3.8 + ((index * 13) % 12) / 10) * 10) / 10,
    numReviews: 8 + ((index * 5) % 120),
    soldCount: 20 + ((index * 17) % 400),
    warrantyMonths: bp.accessory ? 0 : 12,
    returnDays: 14,
    tags: [bp.cat.toLowerCase(), bp.brand.toLowerCase(), bp.shape, bp.gender].filter(Boolean),
    collections: bp.sun ? ['summer-2026'] : [],
    isActive: true,
    ...bp.flags,
  };
}

export async function seedAll() {
  await destroyAll();

  const categories = await Category.insertMany(CATEGORIES);
  const brands = await Brand.insertMany(BRANDS);
  const catMap = Object.fromEntries(categories.map((c) => [c.name, c._id]));
  const brandMap = Object.fromEntries(brands.map((b) => [b.name, b._id]));

  const productDocs = BLUEPRINTS.map((bp, i) => buildProduct(bp, i, catMap, brandMap));
  // Use create() (not insertMany) so pre-validate hooks generate slugs.
  const products = await Product.create(productDocs);
  // The catalog search endpoint depends on the text index. Await its creation
  // so a freshly seeded database can be searched immediately.
  await Product.init();
  logger.info(`Seeded ${products.length} products, ${categories.length} categories, ${brands.length} brands`);

  const admin = await User.create({
    name: 'Store Admin',
    email: env.SEED_ADMIN_EMAIL,
    password: env.SEED_ADMIN_PASSWORD,
    role: 'admin',
    isEmailVerified: true,
  });
  const demo = await User.create({
    name: 'Demo Customer',
    email: 'demo@onlinechasmewala.com',
    password: 'Demo@123',
    isEmailVerified: true,
    addresses: [
      {
        label: 'Home',
        fullName: 'Demo Customer',
        phone: '9000000000',
        line1: '12 MG Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
        isDefault: true,
      },
    ],
  });

  await Banner.insertMany([
    { title: 'See the world, beautifully', subtitle: 'Premium frames from ₹999', image: img('banner-hero'), placement: 'hero', ctaLabel: 'Shop Eyeglasses', ctaLink: '/products?category=eyeglasses', order: 1 },
    { title: 'Summer Sunglasses', subtitle: 'Polarized protection, up to 50% off', image: img('banner-sun'), placement: 'hero', theme: 'light', ctaLabel: 'Shop Sunglasses', ctaLink: '/products?category=sunglasses', order: 2 },
    { title: 'Screen time, sorted', subtitle: 'Blue-light computer glasses', image: img('banner-blu'), placement: 'secondary', ctaLink: '/products?category=computer-glasses', order: 3 },
  ]);

  await Offer.insertMany([
    { title: 'Buy 1 Get 1 Free', subtitle: 'On selected eyeglasses', badge: 'BOGO', image: img('offer-bogo'), discountType: 'percentage', discountValue: 50, ctaLink: '/products?category=eyeglasses', order: 1 },
    { title: 'Summer Collection', subtitle: 'Sunglasses for the season', badge: 'Up to 50% off', image: img('offer-summer'), appliesTo: 'category', categories: [catMap.Sunglasses], discountType: 'percentage', discountValue: 40, ctaLink: '/products?category=sunglasses', order: 2 },
    { title: 'Students Save More', subtitle: 'Extra 15% with code STUDENT15', badge: 'Student offer', image: img('offer-student'), discountType: 'percentage', discountValue: 15, ctaLink: '/products', order: 3 },
  ]);

  const oneYear = new Date();
  oneYear.setFullYear(oneYear.getFullYear() + 1);
  await Coupon.insertMany([
    { code: 'WELCOME10', description: '10% off your first order', type: 'percentage', value: 10, maxDiscount: 300, minOrderValue: 999, expiresAt: oneYear },
    { code: 'FLAT200', description: '₹200 off above ₹1499', type: 'flat', value: 200, minOrderValue: 1499, expiresAt: oneYear },
    { code: 'STUDENT15', description: '15% student discount', type: 'percentage', value: 15, maxDiscount: 500, minOrderValue: 1299, expiresAt: oneYear },
  ]);

  // A few sample reviews on the first products.
  const reviewTexts = [
    { rating: 5, title: 'Love these frames', comment: 'Super lightweight and the fit is perfect. Highly recommend!' },
    { rating: 4, title: 'Great value', comment: 'Good quality for the price. Delivery was quick.' },
    { rating: 5, title: 'Exactly as shown', comment: 'Looks premium and feels durable.' },
  ];
  const reviews = [];
  products.slice(0, 6).forEach((p, i) => {
    const r = reviewTexts[i % reviewTexts.length];
    reviews.push({
      product: p._id,
      user: demo._id,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      isVerifiedPurchase: true,
      status: 'approved',
    });
  });
  await Review.insertMany(reviews);

  await Settings.getSingleton();

  logger.info(`Seeded users (admin: ${admin.email}, demo: ${demo.email}), banners, offers, coupons, reviews`);
  return { products: products.length, categories: categories.length, brands: brands.length };
}

export async function destroyAll() {
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Brand.deleteMany({}),
    Product.deleteMany({}),
    Offer.deleteMany({}),
    Banner.deleteMany({}),
    Coupon.deleteMany({}),
    Review.deleteMany({}),
    Settings.deleteMany({}),
  ]);
}

export default { seedAll, destroyAll };
