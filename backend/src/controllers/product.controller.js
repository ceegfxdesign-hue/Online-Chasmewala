import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/ApiResponse.js';
import { productService } from '../services/product.service.js';

export const productController = {
  list: asyncHandler(async (req, res) => {
    const { data, meta } = await productService.list(req.query);
    return sendSuccess(res, { data, meta });
  }),

  facets: asyncHandler(async (req, res) => {
    const data = await productService.facets(req.query);
    return sendSuccess(res, { data });
  }),

  collections: asyncHandler(async (req, res) => {
    const data = await productService.collections();
    return sendSuccess(res, { data });
  }),

  suggest: asyncHandler(async (req, res) => {
    const data = await productService.suggest(req.query.q);
    return sendSuccess(res, { data });
  }),

  getBySlug: asyncHandler(async (req, res) => {
    const data = await productService.getBySlug(req.params.slug);
    return sendSuccess(res, { data });
  }),

  related: asyncHandler(async (req, res) => {
    const data = await productService.related(req.params.slug);
    return sendSuccess(res, { data });
  }),

  // ── Admin ──────────────────────────────────────────────────────────────────
  adminList: asyncHandler(async (req, res) => {
    const { data, meta } = await productService.adminList(req.query);
    return sendSuccess(res, { data, meta });
  }),

  create: asyncHandler(async (req, res) => {
    const data = await productService.create(req.body);
    return sendCreated(res, { message: 'Product created', data });
  }),

  update: asyncHandler(async (req, res) => {
    const data = await productService.update(req.params.id, req.body);
    return sendSuccess(res, { message: 'Product updated', data });
  }),

  remove: asyncHandler(async (req, res) => {
    const data = await productService.remove(req.params.id);
    return sendSuccess(res, { message: 'Product deleted', data });
  }),
};

export default productController;
