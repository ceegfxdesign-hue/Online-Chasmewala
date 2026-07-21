import { Router } from 'express';
import { wishlistController } from '../../controllers/wishlist.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { protect } from '../../middlewares/auth.middleware.js';
import {
  toggleWishlistSchema,
  productIdParamSchema,
  mergeWishlistSchema,
} from '../../validators/shop.validator.js';

const router = Router();
router.use(protect);

router.get('/', wishlistController.get);
router.post('/toggle', validate(toggleWishlistSchema), wishlistController.toggle);
router.delete('/:productId', validate(productIdParamSchema), wishlistController.remove);
router.post('/merge', validate(mergeWishlistSchema), wishlistController.merge);

export default router;
