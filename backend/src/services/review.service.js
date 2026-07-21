/**
 * Review business logic. Phase 5 ships read APIs (list + rating summary) so the
 * product page can display reviews. Create / like / moderation are added in
 * Phase 7 and reuse this service.
 */
import mongoose from 'mongoose';
import { reviewRepository, productRepository, orderRepository } from '../repositories/index.js';
import { ApiError } from '../utils/ApiError.js';
import { getPagination, buildMeta } from '../utils/pagination.js';
import { eventBus, EVENTS } from '../events/eventBus.js';

/** Recompute a product's cached rating + review count from approved reviews. */
async function recomputeProductRating(productId) {
  const rows = await reviewRepository.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(String(productId)), status: 'approved' } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const { avg = 0, count = 0 } = rows[0] || {};
  await productRepository.updateById(productId, {
    rating: Math.round(avg * 10) / 10,
    numReviews: count,
  });
}

async function resolveProductId(slugOrId) {
  if (mongoose.isValidObjectId(slugOrId)) return slugOrId;
  const product = await productRepository.findBySlug(slugOrId).select('_id').lean();
  if (!product) throw ApiError.notFound('Product not found');
  return product._id;
}

export const reviewService = {
  async listByProduct(slugOrId, query = {}) {
    const productId = await resolveProductId(slugOrId);
    const { page, limit, skip } = getPagination(query, { defaultLimit: 10, maxLimit: 50 });

    const filter = { product: productId, status: 'approved' };
    if (query.rating) filter.rating = Number(query.rating);

    const sort =
      query.sort === 'low' ? { rating: 1 } : query.sort === 'high' ? { rating: -1 } : { createdAt: -1 };

    const { data, total } = await reviewRepository.paginate(filter, {
      sort,
      skip,
      limit,
      populate: { path: 'user', select: 'name avatar' },
    });
    return { data, meta: buildMeta({ page, limit, total }) };
  },

  /** Rating breakdown (counts per star + average) for a product. */
  async summary(slugOrId) {
    const productId = await resolveProductId(slugOrId);
    const rows = await reviewRepository.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(String(productId)), status: 'approved' } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
    ]);
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let total = 0;
    let sum = 0;
    rows.forEach((r) => {
      distribution[r._id] = r.count;
      total += r.count;
      sum += r._id * r.count;
    });
    return {
      average: total ? Math.round((sum / total) * 10) / 10 : 0,
      total,
      distribution,
    };
  },

  /** Create a review. Marks it verified if the user has a delivered/confirmed order with the product. */
  async create(userId, slugOrId, { rating, title, comment, images = [] }) {
    const productId = await resolveProductId(slugOrId);

    const existing = await reviewRepository.findOne({ product: productId, user: userId });
    if (existing) throw ApiError.conflict('You have already reviewed this product');

    const purchased = await orderRepository.exists({
      user: userId,
      'items.product': productId,
      status: { $in: ['confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'] },
    });

    const review = await reviewRepository.create({
      product: productId,
      user: userId,
      rating,
      title,
      comment,
      images,
      isVerifiedPurchase: Boolean(purchased),
      status: 'approved',
    });
    await recomputeProductRating(productId);
    eventBus.emitEvent(EVENTS.REVIEW_CREATED, { productId, userId, reviewId: review._id });
    return review.toJSON();
  },

  /** Toggle a like on a review. */
  async toggleLike(userId, reviewId) {
    const review = await reviewRepository.findById(reviewId);
    if (!review) throw ApiError.notFound('Review not found');
    const idx = review.likes.findIndex((u) => String(u) === String(userId));
    let liked;
    if (idx >= 0) {
      review.likes.splice(idx, 1);
      liked = false;
    } else {
      review.likes.push(userId);
      liked = true;
    }
    await review.save();
    return { liked, likeCount: review.likes.length };
  },

  async listMine(userId, query = {}) {
    const { page, limit, skip } = getPagination(query, { defaultLimit: 10, maxLimit: 50 });
    const { data, total } = await reviewRepository.paginate(
      { user: userId },
      { sort: { createdAt: -1 }, skip, limit, populate: { path: 'product', select: 'name slug images' } }
    );
    return { data, meta: buildMeta({ page, limit, total }) };
  },

  async removeMine(userId, reviewId) {
    const review = await reviewRepository.findOne({ _id: reviewId, user: userId });
    if (!review) throw ApiError.notFound('Review not found');
    const productId = review.product;
    await review.deleteOne();
    await recomputeProductRating(productId);
    return { id: reviewId };
  },

  // ── Admin moderation ────────────────────────────────────────────────────────
  async adminList(query = {}) {
    const { page, limit, skip } = getPagination(query, { defaultLimit: 20, maxLimit: 100 });
    const filter = {};
    if (query.status) filter.status = query.status;
    const { data, total } = await reviewRepository.paginate(filter, {
      sort: { createdAt: -1 },
      skip,
      limit,
      populate: [
        { path: 'user', select: 'name email' },
        { path: 'product', select: 'name slug' },
      ],
    });
    return { data, meta: buildMeta({ page, limit, total }) };
  },

  async moderate(reviewId, status) {
    const review = await reviewRepository.updateById(reviewId, { status });
    if (!review) throw ApiError.notFound('Review not found');
    await recomputeProductRating(review.product);
    return review.toJSON();
  },
};

export default reviewService;
