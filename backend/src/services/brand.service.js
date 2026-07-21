import { brandRepository, productRepository } from '../repositories/index.js';
import { ApiError } from '../utils/ApiError.js';

export const brandService = {
  async list({ includeInactive = false, featured } = {}) {
    const filter = includeInactive ? {} : { isActive: true };
    if (featured) filter.isFeatured = true;
    return brandRepository.find(filter, { sort: { order: 1, name: 1 }, lean: true });
  },

  async getBySlug(slug) {
    const brand = await brandRepository.findBySlug(slug).lean();
    if (!brand) throw ApiError.notFound('Brand not found');
    return brand;
  },

  async create(data) {
    return brandRepository.create(data);
  },

  async update(id, data) {
    const brand = await brandRepository.findById(id);
    if (!brand) throw ApiError.notFound('Brand not found');
    Object.assign(brand, data);
    await brand.save();
    return brand;
  },

  async remove(id) {
    const inUse = await productRepository.exists({ brand: id });
    if (inUse) throw ApiError.badRequest('Cannot delete a brand that still has products');
    const brand = await brandRepository.deleteById(id);
    if (!brand) throw ApiError.notFound('Brand not found');
    return { id };
  },
};

export default brandService;
