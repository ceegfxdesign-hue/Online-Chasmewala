import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/ApiResponse.js';
import { userService } from '../services/user.service.js';
import { returnService } from '../services/return.service.js';
import { notificationService } from '../services/notification.service.js';
import { reviewService } from '../services/review.service.js';

export const accountController = {
  // Profile
  updateProfile: asyncHandler(async (req, res) => {
    const data = await userService.updateProfile(req.user._id, req.body);
    return sendSuccess(res, { message: 'Profile updated', data });
  }),
  changePassword: asyncHandler(async (req, res) => {
    const data = await userService.changePassword(req.user._id, req.body);
    return sendSuccess(res, { message: 'Password changed', data });
  }),

  // Addresses
  listAddresses: asyncHandler(async (req, res) => {
    const data = await userService.listAddresses(req.user._id);
    return sendSuccess(res, { data });
  }),
  addAddress: asyncHandler(async (req, res) => {
    const data = await userService.addAddress(req.user._id, req.body);
    return sendCreated(res, { message: 'Address added', data });
  }),
  updateAddress: asyncHandler(async (req, res) => {
    const data = await userService.updateAddress(req.user._id, req.params.id, req.body);
    return sendSuccess(res, { message: 'Address updated', data });
  }),
  removeAddress: asyncHandler(async (req, res) => {
    const data = await userService.removeAddress(req.user._id, req.params.id);
    return sendSuccess(res, { message: 'Address removed', data });
  }),

  // Cards
  listCards: asyncHandler(async (req, res) => {
    const data = await userService.listCards(req.user._id);
    return sendSuccess(res, { data });
  }),
  addCard: asyncHandler(async (req, res) => {
    const data = await userService.addCard(req.user._id, req.body);
    return sendCreated(res, { message: 'Card saved', data });
  }),
  removeCard: asyncHandler(async (req, res) => {
    const data = await userService.removeCard(req.user._id, req.params.id);
    return sendSuccess(res, { message: 'Card removed', data });
  }),

  // Returns
  createReturn: asyncHandler(async (req, res) => {
    const data = await returnService.create(req.user._id, req.body);
    return sendCreated(res, { message: 'Return request created', data });
  }),
  listReturns: asyncHandler(async (req, res) => {
    const { data, meta } = await returnService.listMine(req.user._id, req.query);
    return sendSuccess(res, { data, meta });
  }),
  getReturn: asyncHandler(async (req, res) => {
    const data = await returnService.getMine(req.user._id, req.params.returnNumber);
    return sendSuccess(res, { data });
  }),

  // Notifications
  listNotifications: asyncHandler(async (req, res) => {
    const { data, meta } = await notificationService.list(req.user._id, req.query);
    return sendSuccess(res, { data, meta });
  }),
  markNotificationRead: asyncHandler(async (req, res) => {
    const data = await notificationService.markRead(req.user._id, req.params.id);
    return sendSuccess(res, { data });
  }),
  markAllNotificationsRead: asyncHandler(async (req, res) => {
    const data = await notificationService.markAllRead(req.user._id);
    return sendSuccess(res, { message: 'All notifications marked read', data });
  }),
  removeNotification: asyncHandler(async (req, res) => {
    const data = await notificationService.remove(req.user._id, req.params.id);
    return sendSuccess(res, { message: 'Notification removed', data });
  }),

  // My reviews
  listMyReviews: asyncHandler(async (req, res) => {
    const { data, meta } = await reviewService.listMine(req.user._id, req.query);
    return sendSuccess(res, { data, meta });
  }),
  removeMyReview: asyncHandler(async (req, res) => {
    const data = await reviewService.removeMine(req.user._id, req.params.id);
    return sendSuccess(res, { message: 'Review deleted', data });
  }),
};

export default accountController;
