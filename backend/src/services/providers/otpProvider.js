/**
 * OTP provider interface + mock implementation.
 *
 * The mock "delivers" the OTP by logging it and returning it in dev responses,
 * so the full OTP flow is testable without email/SMS credentials. Swap in a real
 * email/SMS provider by implementing `send()` and selecting it via OTP_PROVIDER.
 */
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';

class MockOtpProvider {
  /**
   * @returns {Promise<{ delivered: boolean, devCode?: string }>}
   */
  async send({ destination, code, purpose }) {
    logger.info(`[OTP:mock] ${purpose} code for ${destination} → ${code}`);
    // Only expose the code outside production to aid local/dev testing.
    return { delivered: true, devCode: env.isProd ? undefined : code };
  }
}

// Real providers (email/sms) would be implemented here and selected below.
const providers = {
  mock: new MockOtpProvider(),
};

export const otpProvider = providers[env.OTP_PROVIDER] || providers.mock;
export default otpProvider;
