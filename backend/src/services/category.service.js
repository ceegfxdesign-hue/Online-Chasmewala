import { categoryRepository, productRepository } from '../repositories/index.js';
import { ApiError } from '../utils/ApiError.js';

export const categoryService = {
  async list({ includeInactive = false } = {}) {
    const filter = includeInactive ? {} : { isActive: true };
    return categoryRepository.find(filter, { sort: { order: 1, name: 1 }, lean: true });
  },

  /** Categories with a live product count — used on the home page. */
  async listWithCounts() {
    const categories = await categoryRepository.find({ isActive: true }, { sort: { order: 1 }, lean: true });
    const counts = await productRepository.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    const map = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));
    return categories.map((c) => ({ ...c, productCount: map[String(c._id)] || 0 }));
  },

  async getBySlug(slug) {
    const category = await categoryRepository.findBySlug(slug).lean();
    if (!category) throw ApiError.notFound('Category not found');
    return category;
  },

  async create(data) {
    return categoryRepository.create(data);
  },

  async update(id, data) {
    const category = await categoryRepository.findById(id);
    if (!category) throw ApiError.notFound('Category not found');
    Object.assign(category, data);
    await category.save();
    return category;
  },

  async remove(id) {
    const inUse = await productRepository.exists({ category: id });
    if (inUse) throw ApiError.badRequest('Cannot delete a category that still has products');
    const category = await categoryRepository.deleteById(id);
    if (!category) throw ApiError.notFound('Category not found');
    return { id };
  },
};

export default categoryService;
