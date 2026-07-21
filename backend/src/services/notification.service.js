/**
 * Notifications. Created by event handlers (order placed, status changed, etc.)
 * and read/managed by the user in their account.
 */
import { notificationRepository } from '../repositories/index.js';
import { ApiError } from '../utils/ApiError.js';
import { getPagination, buildMeta } from '../utils/pagination.js';

export const notificationService = {
  async create({ user, type, title, message, link, icon }) {
    return notificationRepository.create({ user, type, title, message, link, icon });
  },

  async list(userId, query = {}) {
    const { page, limit, skip } = getPagination(query, { defaultLimit: 20, maxLimit: 50 });
    const filter = { user: userId };
    if (query.unread === 'true') filter.isRead = false;
    const { data, total } = await notificationRepository.paginate(filter, { sort: { createdAt: -1 }, skip, limit });
    const unreadCount = await notificationRepository.count({ user: userId, isRead: false });
    return { data, meta: { ...buildMeta({ page, limit, total }), unreadCount } };
  },

  async markRead(userId, id) {
    const n = await notificationRepository.updateOne({ _id: id, user: userId }, { isRead: true });
    if (!n) throw ApiError.notFound('Notification not found');
    return n;
  },

  async markAllRead(userId) {
    await notificationRepository.model.updateMany({ user: userId, isRead: false }, { isRead: true });
    return { ok: true };
  },

  async remove(userId, id) {
    const n = await notificationRepository.model.findOneAndDelete({ _id: id, user: userId });
    if (!n) throw ApiError.notFound('Notification not found');
    return { id };
  },
};

export default notificationService;
