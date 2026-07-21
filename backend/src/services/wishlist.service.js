/**
 * Wishlist stored as product references on the User document. Read returns
 * hydrated product cards; toggle adds/removes; merge folds in a guest wishlist.
 */
import { userRepository, productRepository } from '../repositories/index.js';
import { ApiError } from '../utils/ApiError.js';

async function hydrate(ids) {
  if (!ids.length) return [];
  return productRepository.find(
    { _id: { $in: ids }, isActive: true },
    { populate: 'brand', lean: true }
  );
}

export const wishlistService = {
  async get(userId) {
    const user = await userRepository.findById(userId).select('wishlist').lean();
    return hydrate(user?.wishlist || []);
  },

  async toggle(userId, productId) {
    const product = await productRepository.exists({ _id: productId });
    if (!product) throw ApiError.notFound('Product not found');

    const user = await userRepository.findById(userId).select('wishlist');
    const idx = user.wishlist.findIndex((p) => String(p) === String(productId));
    let added;
    if (idx >= 0) {
      user.wishlist.splice(idx, 1);
      added = false;
    } else {
      user.wishlist.unshift(productId);
      added = true;
    }
    await user.save();
    const items = await hydrate(user.wishlist);
    return { added, items };
  },

  async remove(userId, productId) {
    const user = await userRepository.findById(userId).select('wishlist');
    user.wishlist = user.wishlist.filter((p) => String(p) !== String(productId));
    await user.save();
    return hydrate(user.wishlist);
  },

  async merge(userId, productIds = []) {
    if (!productIds.length) return this.get(userId);
    const user = await userRepository.findById(userId).select('wishlist');
    const existing = new Set(user.wishlist.map(String));
    productIds.forEach((id) => {
      if (!existing.has(String(id))) user.wishlist.unshift(id);
    });
    await user.save();
    return hydrate(user.wishlist);
  },
};

export default wishlistService;
