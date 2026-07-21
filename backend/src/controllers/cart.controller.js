import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { cartService } from '../services/cart.service.js';

export const cartController = {
  get: asyncHandler(async (req, res) => {
    const data = await cartService.get(req.user._id);
    return sendSuccess(res, { data });
  }),
  add: asyncHandler(async (req, res) => {
    const data = await cartService.addItem(req.user._id, req.body);
    return sendSuccess(res, { message: 'Added to cart', data });
  }),
  update: asyncHandler(async (req, res) => {
    const data = await cartService.updateItem(req.user._id, req.params.itemId, req.body.quantity);
    return sendSuccess(res, { message: 'Cart updated', data });
  }),
  remove: asyncHandler(async (req, res) => {
    const data = await cartService.removeItem(req.user._id, req.params.itemId);
    return sendSuccess(res, { message: 'Item removed', data });
  }),
  clear: asyncHandler(async (req, res) => {
    const data = await cartService.clear(req.user._id);
    return sendSuccess(res, { message: 'Cart cleared', data });
  }),
  merge: asyncHandler(async (req, res) => {
    const data = await cartService.merge(req.user._id, req.body.items);
    return sendSuccess(res, { message: 'Cart merged', data });
  }),
};

export default cartController;
