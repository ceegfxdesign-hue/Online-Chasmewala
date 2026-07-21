import { Router } from 'express';
import { brandController } from '../../controllers/brand.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { protect, authorize } from '../../middlewares/auth.middleware.js';
import { ROLES } from '../../constants/index.js';
import {
  slugParamSchema,
  idParamSchema,
  createBrandSchema,
  updateBrandSchema,
} from '../../validators/catalog.validator.js';

const router = Router();

router.get('/', brandController.list);
router.post('/', protect, authorize(ROLES.ADMIN), validate(createBrandSchema), brandController.create);
router.patch('/:id', protect, authorize(ROLES.ADMIN), validate(updateBrandSchema), brandController.update);
router.delete('/:id', protect, authorize(ROLES.ADMIN), validate(idParamSchema), brandController.remove);
router.get('/:slug', validate(slugParamSchema), brandController.getBySlug);

export default router;
