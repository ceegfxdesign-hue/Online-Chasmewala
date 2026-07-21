import { Router } from 'express';
import { categoryController } from '../../controllers/category.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { protect, authorize } from '../../middlewares/auth.middleware.js';
import { ROLES } from '../../constants/index.js';
import {
  slugParamSchema,
  idParamSchema,
  createCategorySchema,
  updateCategorySchema,
} from '../../validators/catalog.validator.js';

const router = Router();

router.get('/', categoryController.list);
router.post('/', protect, authorize(ROLES.ADMIN), validate(createCategorySchema), categoryController.create);
router.patch('/:id', protect, authorize(ROLES.ADMIN), validate(updateCategorySchema), categoryController.update);
router.delete('/:id', protect, authorize(ROLES.ADMIN), validate(idParamSchema), categoryController.remove);
router.get('/:slug', validate(slugParamSchema), categoryController.getBySlug);

export default router;
