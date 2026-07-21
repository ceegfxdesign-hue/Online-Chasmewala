import { Router } from 'express';
import { accountController } from '../../controllers/account.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { protect } from '../../middlewares/auth.middleware.js';
import {
  updateProfileSchema,
  changePasswordSchema,
  addAddressSchema,
  updateAddressSchema,
  addCardSchema,
  createReturnSchema,
  returnNumberParam,
  idParam,
} from '../../validators/account.validator.js';

const router = Router();
router.use(protect);

// Profile
router.patch('/profile', validate(updateProfileSchema), accountController.updateProfile);
router.post('/change-password', validate(changePasswordSchema), accountController.changePassword);

// Addresses
router.get('/addresses', accountController.listAddresses);
router.post('/addresses', validate(addAddressSchema), accountController.addAddress);
router.patch('/addresses/:id', validate(updateAddressSchema), accountController.updateAddress);
router.delete('/addresses/:id', validate(idParam), accountController.removeAddress);

// Saved cards
router.get('/cards', accountController.listCards);
router.post('/cards', validate(addCardSchema), accountController.addCard);
router.delete('/cards/:id', validate(idParam), accountController.removeCard);

// Returns & exchanges
router.post('/returns', validate(createReturnSchema), accountController.createReturn);
router.get('/returns', accountController.listReturns);
router.get('/returns/:returnNumber', validate(returnNumberParam), accountController.getReturn);

// Notifications
router.get('/notifications', accountController.listNotifications);
router.post('/notifications/read-all', accountController.markAllNotificationsRead);
router.patch('/notifications/:id/read', validate(idParam), accountController.markNotificationRead);
router.delete('/notifications/:id', validate(idParam), accountController.removeNotification);

// My reviews
router.get('/reviews', accountController.listMyReviews);
router.delete('/reviews/:id', validate(idParam), accountController.removeMyReview);

export default router;
