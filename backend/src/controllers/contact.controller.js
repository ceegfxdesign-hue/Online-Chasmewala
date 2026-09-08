/** Forward validated inquiries; never report success when delivery failed. */
import { emailService } from '../services/email.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
export const contactController = {
  submit: asyncHandler(async (req, res) => {
    const result = await emailService.sendContactInquiry(req.body);
    if (!result.delivered && !result.mocked) throw new ApiError(503, 'Unable to send your inquiry. Please email support@onlinechasmewala.com directly.');
    return sendSuccess(res, { message: result.mocked ? 'Inquiry recorded in development logs (email not sent).' : 'Your inquiry has been sent.' });
  }),
};
