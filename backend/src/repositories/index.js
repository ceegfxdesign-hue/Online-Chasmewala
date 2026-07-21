/**
 * Repository instances. Each wraps a model with BaseRepository; a few add
 * domain-specific query helpers. Import these singletons from services.
 */
import { BaseRepository } from './BaseRepository.js';
import {
  User,
  Category,
  Brand,
  Product,
  Cart,
  Order,
  Review,
  Coupon,
  Offer,
  Banner,
  Notification,
  Return,
  RecentlyViewed,
  Inventory,
  Settings,
} from '../models/index.js';

class UserRepository extends BaseRepository {
  findByEmail(email, { withPassword = false } = {}) {
    const q = this.model.findOne({ email: String(email).toLowerCase() });
    return withPassword ? q.select('+password') : q;
  }

  findAuthById(id) {
    return this.model.findById(id).select('+refreshTokens');
  }
}

class ProductRepository extends BaseRepository {
  findBySlug(slug) {
    return this.model
      .findOne({ slug, isActive: true })
      .populate('category', 'name slug')
      .populate('brand', 'name slug logo');
  }
}

class CategoryRepository extends BaseRepository {
  findBySlug(slug) {
    return this.model.findOne({ slug });
  }
}

class BrandRepository extends BaseRepository {
  findBySlug(slug) {
    return this.model.findOne({ slug });
  }
}

class OrderRepository extends BaseRepository {
  findByNumber(orderNumber, userFilter = {}) {
    return this.model.findOne({ orderNumber, ...userFilter });
  }
}

class CouponRepository extends BaseRepository {
  findByCode(code) {
    return this.model.findOne({ code: String(code).toUpperCase() });
  }
}

export const userRepository = new UserRepository(User);
export const categoryRepository = new CategoryRepository(Category);
export const brandRepository = new BrandRepository(Brand);
export const productRepository = new ProductRepository(Product);
export const cartRepository = new BaseRepository(Cart);
export const orderRepository = new OrderRepository(Order);
export const reviewRepository = new BaseRepository(Review);
export const couponRepository = new CouponRepository(Coupon);
export const offerRepository = new BaseRepository(Offer);
export const bannerRepository = new BaseRepository(Banner);
export const notificationRepository = new BaseRepository(Notification);
export const returnRepository = new BaseRepository(Return);
export const recentlyViewedRepository = new BaseRepository(RecentlyViewed);
export const inventoryRepository = new BaseRepository(Inventory);
export const settingsRepository = new BaseRepository(Settings);
