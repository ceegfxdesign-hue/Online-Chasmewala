import { Router } from 'express';
import { cartController } from '../../controllers/cart.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { protect } from '../../middlewares/auth.middleware.js';
import {
  addCartItemSchema,
  updateCartItemSchema,
  itemIdParamSchema,
  mergeCartSchema,
} from '../../validators/shop.validator.js';

const router = Router();
router.use(protect); // all cart operations require auth

router.get('/', cartController.get);
router.post('/items', validate(addCartItemSchema), cartController.add);
router.patch('/items/:itemId', validate(updateCartItemSchema), cartController.update);
router.delete('/items/:itemId', validate(itemIdParamSchema), cartController.remove);
router.delete('/', cartController.clear);
router.post('/merge', validate(mergeCartSchema), cartController.merge);

export default router;
