import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { contactController } from '../../controllers/contact.controller.js';
import { contactSchema } from '../../validators/contact.validator.js';
import { validate } from '../../middlewares/validate.middleware.js';
const router = Router();
router.post('/', rateLimit({ windowMs: 15 * 60 * 1000, max: 5, standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Too many inquiries. Please try again later.' },
}), validate(contactSchema), contactController.submit);
export default router;
