import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utils/ApiResponse.js';
import { orderService } from '../services/order.service.js';

export const orderController = {
  quote: asyncHandler(async (req, res) => {
    const data = await orderService.quote(req.user._id, req.body);
    return sendSuccess(res, { data });
  }),
  create: asyncHandler(async (req, res) => {
    const data = await orderService.create(req.user._id, req.body);
    return sendCreated(res, { message: 'Order placed', data });
  }),
  listMine: asyncHandler(async (req, res) => {
    const { data, meta } = await orderService.listMine(req.user._id, req.query);
    return sendSuccess(res, { data, meta });
  }),
  getMine: asyncHandler(async (req, res) => {
    const data = await orderService.getMine(req.user._id, req.params.orderNumber);
    return sendSuccess(res, { data });
  }),
  cancel: asyncHandler(async (req, res) => {
    const data = await orderService.cancel(req.user._id, req.params.orderNumber, req.body.reason);
    return sendSuccess(res, { message: 'Order cancelled', data });
  }),
};

export default orderController;
