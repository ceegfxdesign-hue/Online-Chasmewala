/**
 * OTP provider interface + mock implementation.
 *
 * The mock "delivers" the OTP through development/test server logs only,
 * so the full OTP flow is testable without email/SMS credentials. Swap in a real
 * email/SMS provider by implementing `send()` and selecting it via OTP_PROVIDER.
 */
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { ApiError } from '../../utils/ApiError.js';

class MockOtpProvider {
  /**
   * @returns {Promise<{ delivered: boolean }>}
   */
  async send({ destination, code, purpose }) {
    if (env.isProd) throw new ApiError(503, 'OTP delivery is not configured.');
    logger.info(`[OTP:mock] ${purpose} code for ${destination} → ${code}`);
    return { delivered: true };
  }
}

// Real providers (email/sms) would be implemented here and selected below.
const providers = {
  mock: new MockOtpProvider(),
};

export const otpProvider = providers[env.OTP_PROVIDER] || providers.mock;
export default otpProvider;
