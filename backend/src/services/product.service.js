/**
 * Product catalog business logic: filtered/sorted/paginated listings, search,
 * detail lookups, related products, filter facets, and admin CRUD.
 */
import mongoose from 'mongoose';
import {
  productRepository,
  categoryRepository,
  brandRepository,
} from '../repositories/index.js';
import { ApiError } from '../utils/ApiError.js';
import { getPagination, buildMeta } from '../utils/pagination.js';

const SORT_MAP = {
  newest: { createdAt: -1 },
  'price-asc': { price: 1 },
  'price-desc': { price: -1 },
  rating: { rating: -1, numReviews: -1 },
  popular: { soldCount: -1 },
  discount: { discountPercent: -1 },
  relevance: { score: { $meta: 'textScore' }, soldCount: -1 },
};

const asArray = (val) =>
  Array.isArray(val) ? val : typeof val === 'string' ? val.split(',').map((v) => v.trim()) : [];

/** Resolve a comma-separated list of slugs (or ids) to ObjectIds. */
async function resolveRefs(repo, value) {
  const tokens = asArray(value).filter(Boolean);
  if (!tokens.length) return [];
  const ids = [];
  const slugs = [];
  tokens.forEach((t) => (mongoose.isValidObjectId(t) ? ids.push(t) : slugs.push(t)));
  if (slugs.length) {
    const docs = await repo.find({ slug: { $in: slugs } }, { select: '_id', lean: true });
    docs.forEach((d) => ids.push(d._id));
  }
  return ids;
}

async function buildFilter(query) {
  const filter = { isActive: true };

  if (query.search) filter.$text = { $search: query.search };

  const [categoryIds, brandIds] = await Promise.all([
    resolveRefs(categoryRepository, query.category),
    resolveRefs(brandRepository, query.brand),
  ]);
  if (categoryIds.length) filter.category = { $in: categoryIds };
  if (brandIds.length) filter.brand = { $in: brandIds };

  const multi = (field, value) => {
    const vals = asArray(value).filter(Boolean);
    if (vals.length) filter[field] = { $in: vals };
  };
  multi('gender', query.gender);
  multi('frameShape', query.frameShape);
  multi('frameType', query.frameType);
  multi('frameMaterial', query.frameMaterial);
  multi('lensType', query.lensType);
  multi('frameSize', query.frameSize);
  multi('rimType', query.rimType);

  if (query.faceShape) filter.suitableFaceShapes = query.faceShape;
  if (query.color) filter['variants.color'] = new RegExp(query.color, 'i');

  if (query.minPrice != null || query.maxPrice != null) {
    filter.price = {};
    if (query.minPrice != null) filter.price.$gte = query.minPrice;
    if (query.maxPrice != null) filter.price.$lte = query.maxPrice;
  }
  if (query.minRating != null) filter.rating = { $gte: query.minRating };

  ['blueLightFilter', 'polarized', 'uvProtection'].forEach((f) => {
    if (query[f] === true) filter[f] = true;
  });
  if (query.inStock === true) filter.stock = { $gt: 0 };
  if (query.onOffer === true) filter.$expr = { $lt: ['$price', '$mrp'] };
  if (query.tags) multi('tags', query.tags);

  return filter;
}

export const productService = {
  async list(query) {
    const { page, limit, skip } = getPagination(query, { defaultLimit: 12, maxLimit: 60 });
    const filter = await buildFilter(query);

    const sortKey = query.sort || (query.search ? 'relevance' : 'newest');
    const sort = SORT_MAP[sortKey] || SORT_MAP.newest;

    const projection = query.search ? { score: { $meta: 'textScore' } } : undefined;
    let q = productRepository.model
      .find(filter, projection)
      .populate('category', 'name slug')
      .populate('brand', 'name slug logo')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const [data, total] = await Promise.all([q.exec(), productRepository.count(filter)]);
    return { data, meta: buildMeta({ page, limit, total }) };
  },

  async getBySlug(slug) {
    const product = await productRepository.findBySlug(slug).lean();
    if (!product) throw ApiError.notFound('Product not found');
    return product;
  },

  async getById(id) {
    const product = await productRepository.findById(id).lean();
    if (!product) throw ApiError.notFound('Product not found');
    return product;
  },

  /** Related products: same category, excluding the current product. */
  async related(slug, limit = 8) {
    const product = await productRepository.findBySlug(slug).lean();
    if (!product) throw ApiError.notFound('Product not found');
    const data = await productRepository.find(
      { _id: { $ne: product._id }, category: product.category, isActive: true },
      { sort: { soldCount: -1 }, limit, populate: 'brand', lean: true }
    );
    return data;
  },

  /**
   * Facet counts for the filter sidebar, scoped to the current filter (minus the
   * facet being counted would be ideal; here we scope to category for relevance).
   */
  async facets(query) {
    const base = await buildFilter({ ...query, gender: undefined, frameShape: undefined });
    const [byShape, byMaterial, byType, byGender, priceRange, brands] = await Promise.all([
      productRepository.aggregate([{ $match: base }, { $group: { _id: '$frameShape', count: { $sum: 1 } } }]),
      productRepository.aggregate([{ $match: base }, { $group: { _id: '$frameMaterial', count: { $sum: 1 } } }]),
      productRepository.aggregate([{ $match: base }, { $group: { _id: '$frameType', count: { $sum: 1 } } }]),
      productRepository.aggregate([{ $match: base }, { $group: { _id: '$gender', count: { $sum: 1 } } }]),
      productRepository.aggregate([
        { $match: base },
        { $group: { _id: null, min: { $min: '$price' }, max: { $max: '$price' } } },
      ]),
      productRepository.aggregate([
        { $match: base },
        { $group: { _id: '$brand', count: { $sum: 1 } } },
        { $lookup: { from: 'brands', localField: '_id', foreignField: '_id', as: 'brand' } },
        { $unwind: '$brand' },
        { $project: { count: 1, name: '$brand.name', slug: '$brand.slug' } },
        { $sort: { count: -1 } },
      ]),
    ]);

    const clean = (arr) => arr.filter((x) => x._id).map((x) => ({ value: x._id, count: x.count }));
    return {
      frameShape: clean(byShape),
      frameMaterial: clean(byMaterial),
      frameType: clean(byType),
      gender: clean(byGender),
      brands: brands.map((b) => ({ value: b.slug, label: b.name, count: b.count })),
      price: priceRange[0] ? { min: priceRange[0].min, max: priceRange[0].max } : { min: 0, max: 10000 },
    };
  },

  /** Curated home-page collections in one call. */
  async collections() {
    const common = { isActive: true };
    const pick = (extra, sort) =>
      productRepository.find(
        { ...common, ...extra },
        { sort, limit: 12, populate: 'brand', lean: true }
      );
    const [bestSellers, trending, newArrivals, featured] = await Promise.all([
      pick({ isBestSeller: true }, { soldCount: -1 }),
      pick({ isTrending: true }, { createdAt: -1 }),
      pick({ isNewArrival: true }, { createdAt: -1 }),
      pick({ isFeatured: true }, { rating: -1 }),
    ]);
    return { bestSellers, trending, newArrivals, featured };
  },

  /** Instant-search suggestions (lightweight). */
  async suggest(term, limit = 6) {
    if (!term || term.trim().length < 2) return { products: [], brands: [], categories: [] };
    const rx = new RegExp(term.trim(), 'i');
    const [products, brands, categories] = await Promise.all([
      productRepository.find(
        { isActive: true, $or: [{ name: rx }, { tags: rx }, { sku: rx }] },
        { select: 'name slug images price', limit, lean: true }
      ),
      brandRepository.find({ name: rx }, { select: 'name slug', limit: 4, lean: true }),
      categoryRepository.find({ name: rx }, { select: 'name slug', limit: 4, lean: true }),
    ]);
    return { products, brands, categories };
  },

  // ── Admin CRUD ─────────────────────────────────────────────────────────────
  async create(data) {
    if (data.mrp < data.price) throw ApiError.badRequest('MRP cannot be less than price');
    return productRepository.create(data);
  },

  async update(id, data) {
    const product = await productRepository.findById(id);
    if (!product) throw ApiError.notFound('Product not found');
    Object.assign(product, data);
    if (product.mrp < product.price) throw ApiError.badRequest('MRP cannot be less than price');
    await product.save(); // triggers slug + discountPercent hooks + validation
    return product;
  },

  async remove(id) {
    const product = await productRepository.deleteById(id);
    if (!product) throw ApiError.notFound('Product not found');
    return { id };
  },

  /** Admin listing including inactive products. */
  async adminList(query) {
    const { page, limit, skip } = getPagination(query, { defaultLimit: 20, maxLimit: 100 });
    const filter = {};
    if (query.search) filter.$or = [
      { name: new RegExp(query.search, 'i') },
      { sku: new RegExp(query.search, 'i') },
    ];
    if (query.lowStock === 'true') filter.$expr = { $lte: ['$stock', '$lowStockThreshold'] };
    const { data, total } = await productRepository.paginate(filter, {
      sort: { createdAt: -1 },
      skip,
      limit,
      populate: [
        { path: 'category', select: 'name' },
        { path: 'brand', select: 'name' },
      ],
    });
    return { data, meta: buildMeta({ page, limit, total }) };
  },
};

export default productService;
