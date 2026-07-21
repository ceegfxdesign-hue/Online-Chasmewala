/**
 * Returns & exchanges. A customer can request a return/exchange for a delivered
 * order; admins approve/reject and process refunds.
 */
import { returnRepository, orderRepository } from '../repositories/index.js';
import { ApiError } from '../utils/ApiError.js';
import { getPagination, buildMeta } from '../utils/pagination.js';
import { RETURN_STATUS, ORDER_STATUS } from '../constants/index.js';
import { eventBus, EVENTS } from '../events/eventBus.js';

export const returnService = {
  async create(userId, { orderNumber, type, items, reason, exchangeFor, comment }) {
    const order = await orderRepository.findByNumber(orderNumber, { user: userId });
    if (!order) throw ApiError.notFound('Order not found');
    if (order.status !== ORDER_STATUS.DELIVERED) {
      throw ApiError.badRequest('Only delivered orders can be returned or exchanged');
    }

    const existing = await returnRepository.findOne({ order: order._id, status: { $ne: RETURN_STATUS.REJECTED } });
    if (existing) throw ApiError.conflict('A return request already exists for this order');

    // Build return items from the order snapshot.
    const reqItems = (items?.length ? items : order.items).map((it) => {
      const source = order.items.find((oi) => String(oi.product) === String(it.product)) || order.items[0];
      return {
        product: source.product,
        name: source.name,
        quantity: it.quantity || source.quantity,
        reason: it.reason || reason || 'Not specified',
      };
    });

    const refundAmount = reqItems.reduce((sum, ri) => {
      const source = order.items.find((oi) => String(oi.product) === String(ri.product));
      return sum + (source ? source.price * ri.quantity : 0);
    }, 0);

    const doc = await returnRepository.create({
      order: order._id,
      user: userId,
      type: type || 'return',
      items: reqItems,
      exchangeFor,
      comment,
      refund: { amount: type === 'exchange' ? 0 : refundAmount, status: 'pending' },
    });

    eventBus.emitEvent(EVENTS.RETURN_REQUESTED, { userId, returnNumber: doc.returnNumber });
    return doc.toObject();
  },

  async listMine(userId, query = {}) {
    const { page, limit, skip } = getPagination(query, { defaultLimit: 10, maxLimit: 50 });
    const { data, total } = await returnRepository.paginate(
      { user: userId },
      { sort: { createdAt: -1 }, skip, limit, populate: { path: 'order', select: 'orderNumber' } }
    );
    return { data, meta: buildMeta({ page, limit, total }) };
  },

  async getMine(userId, returnNumber) {
    const doc = await returnRepository.findOne({ returnNumber, user: userId }).populate('order', 'orderNumber');
    if (!doc) throw ApiError.notFound('Return request not found');
    return doc.toObject();
  },

  // ── Admin ──────────────────────────────────────────────────────────────────
  async adminList(query = {}) {
    const { page, limit, skip } = getPagination(query, { defaultLimit: 20, maxLimit: 100 });
    const filter = {};
    if (query.status) filter.status = query.status;
    const { data, total } = await returnRepository.paginate(filter, {
      sort: { createdAt: -1 },
      skip,
      limit,
      populate: [
        { path: 'user', select: 'name email' },
        { path: 'order', select: 'orderNumber' },
      ],
    });
    return { data, meta: buildMeta({ page, limit, total }) };
  },

  async updateStatus(returnId, status, note) {
    const doc = await returnRepository.findById(returnId);
    if (!doc) throw ApiError.notFound('Return request not found');
    doc.status = status;
    doc.timeline.push({ status, note });
    if (status === RETURN_STATUS.REFUNDED) {
      doc.refund.status = 'processed';
      doc.refund.processedAt = new Date();
    }
    await doc.save();
    eventBus.emitEvent(EVENTS.RETURN_STATUS_CHANGED, {
      userId: doc.user,
      returnNumber: doc.returnNumber,
      status: doc.status,
    });
    return doc.toObject();
  },
};

export default returnService;
