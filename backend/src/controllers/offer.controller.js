import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { offerService } from '../services/offer.service.js';

export const offerController = {
  listActive: asyncHandler(async (_req, res) => {
    const data = await offerService.listActive();
    return sendSuccess(res, { data });
  }),
};

export default offerController;
