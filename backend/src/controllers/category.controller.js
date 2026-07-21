import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/ApiResponse.js';
import { categoryService } from '../services/category.service.js';

export const categoryController = {
  list: asyncHandler(async (req, res) => {
    const data = await categoryService.listWithCounts();
    return sendSuccess(res, { data });
  }),

  getBySlug: asyncHandler(async (req, res) => {
    const data = await categoryService.getBySlug(req.params.slug);
    return sendSuccess(res, { data });
  }),

  create: asyncHandler(async (req, res) => {
    const data = await categoryService.create(req.body);
    return sendCreated(res, { message: 'Category created', data });
  }),

  update: asyncHandler(async (req, res) => {
    const data = await categoryService.update(req.params.id, req.body);
    return sendSuccess(res, { message: 'Category updated', data });
  }),

  remove: asyncHandler(async (req, res) => {
    const data = await categoryService.remove(req.params.id);
    return sendSuccess(res, { message: 'Category deleted', data });
  }),
};

export default categoryController;
