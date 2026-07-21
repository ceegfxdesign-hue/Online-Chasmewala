import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/ApiResponse.js';
import { brandService } from '../services/brand.service.js';

export const brandController = {
  list: asyncHandler(async (req, res) => {
    const data = await brandService.list({ featured: req.query.featured === 'true' });
    return sendSuccess(res, { data });
  }),

  getBySlug: asyncHandler(async (req, res) => {
    const data = await brandService.getBySlug(req.params.slug);
    return sendSuccess(res, { data });
  }),

  create: asyncHandler(async (req, res) => {
    const data = await brandService.create(req.body);
    return sendCreated(res, { message: 'Brand created', data });
  }),

  update: asyncHandler(async (req, res) => {
    const data = await brandService.update(req.params.id, req.body);
    return sendSuccess(res, { message: 'Brand updated', data });
  }),

  remove: asyncHandler(async (req, res) => {
    const data = await brandService.remove(req.params.id);
    return sendSuccess(res, { message: 'Brand deleted', data });
  }),
};

export default brandController;
