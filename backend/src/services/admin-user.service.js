/**
 * Admin user management: list/search customers & staff, view details, toggle
 * active status and role. Guards against an admin locking themselves out.
 */
import { userRepository, orderRepository } from '../repositories/index.js';
import { ApiError } from '../utils/ApiError.js';
import { getPagination, buildMeta } from '../utils/pagination.js';
import { ROLES } from '../constants/index.js';

export const adminUserService = {
  async list(query = {}) {
    const { page, limit, skip } = getPagination(query, { defaultLimit: 20, maxLimit: 100 });
    const filter = {};
    if (query.role) filter.role = query.role;
    if (query.search) {
      filter.$or = [
        { name: new RegExp(query.search, 'i') },
        { email: new RegExp(query.search, 'i') },
      ];
    }
    const { data, total } = await userRepository.paginate(filter, {
      sort: { createdAt: -1 },
      skip,
      limit,
      select: '-password -refreshTokens',
    });
    return { data, meta: buildMeta({ page, limit, total }) };
  },

  async get(userId) {
    const user = await userRepository.findById(userId).select('-password -refreshTokens').lean();
    if (!user) throw ApiError.notFound('User not found');
    const [orderCount, spendAgg] = await Promise.all([
      orderRepository.count({ user: userId }),
      orderRepository.aggregate([
        { $match: { user: user._id, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } },
      ]),
    ]);
    return { ...user, stats: { orders: orderCount, totalSpent: Math.round(spendAgg[0]?.total || 0) } };
  },

  async setActive(actingAdminId, userId, isActive) {
    if (String(actingAdminId) === String(userId) && !isActive) {
      throw ApiError.badRequest('You cannot deactivate your own account');
    }
    const user = await userRepository.updateById(userId, { isActive });
    if (!user) throw ApiError.notFound('User not found');
    return user.toJSON();
  },

  async setRole(actingAdminId, userId, role) {
    if (!Object.values(ROLES).includes(role)) throw ApiError.badRequest('Invalid role');
    if (String(actingAdminId) === String(userId) && role !== ROLES.ADMIN) {
      throw ApiError.badRequest('You cannot change your own role');
    }
    const user = await userRepository.updateById(userId, { role });
    if (!user) throw ApiError.notFound('User not found');
    return user.toJSON();
  },
};

export default adminUserService;
