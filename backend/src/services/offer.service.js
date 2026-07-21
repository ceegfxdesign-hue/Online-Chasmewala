/** Public seasonal offers. Discount application remains coupon-driven. */
import { offerRepository } from '../repositories/index.js';

export const offerService = {
  async listActive() {
    const now = new Date();
    return offerRepository.find(
      {
        isActive: true,
        startsAt: { $lte: now },
        $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gte: now } }],
      },
      { sort: { order: 1, createdAt: -1 }, lean: true }
    );
  },
};

export default offerService;
