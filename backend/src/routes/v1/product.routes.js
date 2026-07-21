import { Router } from 'express';
import { productController } from '../../controllers/product.controller.js';
import { reviewController } from '../../controllers/review.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { protect, authorize } from '../../middlewares/auth.middleware.js';
import { ROLES } from '../../constants/index.js';
import {
  listProductsSchema,
  slugParamSchema,
  createProductSchema,
  updateProductSchema,
  idParamSchema,
} from '../../validators/product.validator.js';
import { createReviewSchema } from '../../validators/account.validator.js';

const router = Router();

// ── Public ────────────────────────────────────────────────────────────────
router.get('/', validate(listProductsSchema), productController.list);
router.get('/facets', validate(listProductsSchema), productController.facets);
router.get('/collections', productController.collections);
router.get('/suggest', productController.suggest);

// ── Admin (place before /:slug to avoid capture) ────────────────────────────
router.get('/admin', protect, authorize(ROLES.ADMIN), productController.adminList);
router.post(
  '/',
  protect,
  authorize(ROLES.ADMIN),
  validate(createProductSchema),
  productController.create
);
router.patch(
  '/:id',
  protect,
  authorize(ROLES.ADMIN),
  validate(updateProductSchema),
  productController.update
);
router.delete(
  '/:id',
  protect,
  authorize(ROLES.ADMIN),
  validate(idParamSchema),
  productController.remove
);

// ── Public by slug ──────────────────────────────────────────────────────────
router.get('/:slug/related', validate(slugParamSchema), productController.related);
router.get('/:slug/reviews', validate(slugParamSchema), reviewController.listByProduct);
router.get('/:slug/reviews/summary', validate(slugParamSchema), reviewController.summary);
router.post('/:slug/reviews', protect, validate(createReviewSchema), reviewController.create);
router.post('/reviews/:id/like', protect, reviewController.toggleLike);
router.get('/:slug', validate(slugParamSchema), productController.getBySlug);

export default router;
