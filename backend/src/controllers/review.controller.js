import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/ApiResponse.js';
import { reviewService } from '../services/review.service.js';

export const reviewController = {
  listByProduct: asyncHandler(async (req, res) => {
    const { data, meta } = await reviewService.listByProduct(req.params.slug, req.query);
    return sendSuccess(res, { data, meta });
  }),

  summary: asyncHandler(async (req, res) => {
    const data = await reviewService.summary(req.params.slug);
    return sendSuccess(res, { data });
  }),

  create: asyncHandler(async (req, res) => {
    const data = await reviewService.create(req.user._id, req.params.slug, req.body);
    return sendCreated(res, { message: 'Review submitted', data });
  }),

  toggleLike: asyncHandler(async (req, res) => {
    const data = await reviewService.toggleLike(req.user._id, req.params.id);
    return sendSuccess(res, { data });
  }),
};

export default reviewController;
