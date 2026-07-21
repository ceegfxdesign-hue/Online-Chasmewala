/**
 * Homepage banners / hero slides. Public read returns active banners for the
 * current window; admin has full CRUD.
 */
import { bannerRepository } from '../repositories/index.js';
import { ApiError } from '../utils/ApiError.js';

export const bannerService = {
  async listActive(placement) {
    const now = new Date();
    const filter = {
      isActive: true,
      $and: [
        { $or: [{ startsAt: { $exists: false } }, { startsAt: { $lte: now } }] },
        { $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gte: now } }] },
      ],
    };
    if (placement) filter.placement = placement;
    return bannerRepository.find(filter, { sort: { order: 1, createdAt: -1 }, lean: true });
  },

  async adminList() {
    return bannerRepository.find({}, { sort: { order: 1, createdAt: -1 }, lean: true });
  },
  async create(data) {
    return bannerRepository.create(data);
  },
  async update(id, data) {
    const banner = await bannerRepository.updateById(id, data);
    if (!banner) throw ApiError.notFound('Banner not found');
    return banner;
  },
  async remove(id) {
    const banner = await bannerRepository.deleteById(id);
    if (!banner) throw ApiError.notFound('Banner not found');
    return { id };
  },
};

export default bannerService;
