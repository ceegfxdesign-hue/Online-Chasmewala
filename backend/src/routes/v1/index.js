/**
 * Aggregates all v1 routers. Resource routers are mounted here as each phase
 * lands (auth, products, cart, orders, admin, …).
 */
import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import productRoutes from './product.routes.js';
import categoryRoutes from './category.routes.js';
import brandRoutes from './brand.routes.js';
import cartRoutes from './cart.routes.js';
import wishlistRoutes from './wishlist.routes.js';
import couponRoutes from './coupon.routes.js';
import orderRoutes from './order.routes.js';
import accountRoutes from './account.routes.js';
import adminRoutes from './admin.routes.js';
import bannerRoutes from './banner.routes.js';
import offerRoutes from './offer.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/brands', brandRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/coupons', couponRoutes);
router.use('/orders', orderRoutes);
router.use('/account', accountRoutes);
router.use('/admin', adminRoutes);
router.use('/banners', bannerRoutes);
router.use('/offers', offerRoutes);

export default router;
