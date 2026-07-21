import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { wishlistService } from '../services/wishlist.service.js';

export const wishlistController = {
  get: asyncHandler(async (req, res) => {
    const data = await wishlistService.get(req.user._id);
    return sendSuccess(res, { data });
  }),
  toggle: asyncHandler(async (req, res) => {
    const data = await wishlistService.toggle(req.user._id, req.body.productId);
    return sendSuccess(res, { message: data.added ? 'Added to wishlist' : 'Removed from wishlist', data });
  }),
  remove: asyncHandler(async (req, res) => {
    const data = await wishlistService.remove(req.user._id, req.params.productId);
    return sendSuccess(res, { message: 'Removed from wishlist', data });
  }),
  merge: asyncHandler(async (req, res) => {
    const data = await wishlistService.merge(req.user._id, req.body.productIds);
    return sendSuccess(res, { message: 'Wishlist merged', data });
  }),
};

export default wishlistController;
