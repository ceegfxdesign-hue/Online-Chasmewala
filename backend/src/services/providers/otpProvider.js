/**
 * SMTP OTP delivery with development-only logger fallback.
 *
 * The mock "delivers" the OTP through development/test server logs only,
 * so the full OTP flow is testable without credentials. Configured SMTP always
 * takes precedence; production never treats mock delivery as a sent code.
 */
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { ApiError } from '../../utils/ApiError.js';
import { emailService } from '../email.service.js';

class EmailOtpProvider {
  /**
   * @returns {Promise<{ delivered: boolean }>}
   */
  async send({ destination, code, purpose }) {
    if (emailService.configured) {
      const result = await emailService.sendPasswordOtp({ destination, code, purpose });
      if (!result.delivered) throw new ApiError(503, 'Could not send your verification code. Please try again later.');
      return { delivered: true };
    }
    if (env.isProd) throw new ApiError(503, 'OTP delivery is not configured.');
    logger.info(`[OTP:mock] ${purpose} code for ${destination} → ${code}`);
    return { delivered: true };
  }
}

export const otpProvider = new EmailOtpProvider();
export default otpProvider;
