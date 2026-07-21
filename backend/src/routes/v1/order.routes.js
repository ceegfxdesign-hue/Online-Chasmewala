import { Router } from 'express';
import { orderController } from '../../controllers/order.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { protect } from '../../middlewares/auth.middleware.js';
import {
  quoteSchema,
  createOrderSchema,
  orderNumberParamSchema,
  cancelOrderSchema,
} from '../../validators/shop.validator.js';

const router = Router();
router.use(protect);

router.post('/quote', validate(quoteSchema), orderController.quote);
router.post('/', validate(createOrderSchema), orderController.create);
router.get('/', orderController.listMine);
router.get('/:orderNumber', validate(orderNumberParamSchema), orderController.getMine);
router.post('/:orderNumber/cancel', validate(cancelOrderSchema), orderController.cancel);

export default router;
