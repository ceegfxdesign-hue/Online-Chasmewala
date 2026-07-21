/**
 * Admin analytics: dashboard KPIs, revenue/sales time series, top products,
 * category split, customer stats and low-stock reporting. All aggregations run
 * against confirmed (non-cancelled) orders unless noted.
 */
import {
  orderRepository,
  productRepository,
  userRepository,
  returnRepository,
  reviewRepository,
} from '../repositories/index.js';
import { ORDER_STATUS } from '../constants/index.js';

const PAID_MATCH = { status: { $nin: [ORDER_STATUS.CANCELLED, ORDER_STATUS.PENDING] } };

function rangeStart(range) {
  const now = new Date();
  const map = { '7d': 7, '30d': 30, '90d': 90, '12m': 365 };
  const days = map[range] ?? 30;
  const start = new Date(now);
  start.setDate(start.getDate() - days);
  return start;
}

export const analyticsService = {
  /** Headline KPI cards for the dashboard. */
  async dashboard() {
    const [revenueAgg, orderCount, customerCount, productCount, pendingOrders, lowStock, pendingReturns] =
      await Promise.all([
        orderRepository.aggregate([
          { $match: PAID_MATCH },
          { $group: { _id: null, total: { $sum: '$pricing.total' }, avg: { $avg: '$pricing.total' } } },
        ]),
        orderRepository.count(PAID_MATCH),
        userRepository.count({ role: 'user' }),
        productRepository.count({ isActive: true }),
        orderRepository.count({ status: { $in: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.PACKED] } }),
        productRepository.count({ $expr: { $lte: ['$stock', '$lowStockThreshold'] } }),
        returnRepository.count({ status: 'requested' }),
      ]);

    const revenue = revenueAgg[0] || { total: 0, avg: 0 };
    return {
      revenue: Math.round(revenue.total),
      averageOrderValue: Math.round(revenue.avg || 0),
      orders: orderCount,
      customers: customerCount,
      products: productCount,
      pendingOrders,
      lowStockCount: lowStock,
      pendingReturns,
    };
  },

  /** Revenue + order-count time series grouped by day. */
  async revenueSeries(range = '30d') {
    const start = rangeStart(range);
    const rows = await orderRepository.aggregate([
      { $match: { ...PAID_MATCH, createdAt: { $gte: start } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$pricing.total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    return rows.map((r) => ({ date: r._id, revenue: Math.round(r.revenue), orders: r.orders }));
  },

  /** Best-selling products by units sold within the range. */
  async topProducts(range = '30d', limit = 8) {
    const start = rangeStart(range);
    const rows = await orderRepository.aggregate([
      { $match: { ...PAID_MATCH, createdAt: { $gte: start } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          units: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { units: -1 } },
      { $limit: limit },
    ]);
    return rows.map((r) => ({ productId: r._id, name: r.name, units: r.units, revenue: Math.round(r.revenue) }));
  },

  /** Revenue split by category. */
  async categorySplit(range = '30d') {
    const start = rangeStart(range);
    return orderRepository.aggregate([
      { $match: { ...PAID_MATCH, createdAt: { $gte: start } } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $lookup: {
          from: 'categories',
          localField: 'product.category',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      {
        $group: {
          _id: '$category.name',
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          units: { $sum: '$items.quantity' },
        },
      },
      { $project: { _id: 0, name: '$_id', revenue: { $round: ['$revenue', 0] }, units: 1 } },
      { $sort: { revenue: -1 } },
    ]);
  },

  /** Order status distribution for the funnel/donut. */
  async orderStatusBreakdown() {
    const rows = await orderRepository.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    return rows.map((r) => ({ status: r._id, count: r.count }));
  },

  /** Customer acquisition series + top spenders. */
  async customerStats(range = '30d') {
    const start = rangeStart(range);
    const [signups, topSpenders] = await Promise.all([
      userRepository.aggregate([
        { $match: { role: 'user', createdAt: { $gte: start } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      orderRepository.aggregate([
        { $match: PAID_MATCH },
        { $group: { _id: '$user', spent: { $sum: '$pricing.total' }, orders: { $sum: 1 } } },
        { $sort: { spent: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' },
        { $project: { name: '$user.name', email: '$user.email', spent: { $round: ['$spent', 0] }, orders: 1 } },
      ]),
    ]);
    return {
      signups: signups.map((s) => ({ date: s._id, count: s.count })),
      topSpenders,
    };
  },

  /** Low-stock and out-of-stock products for inventory alerts. */
  async lowStock() {
    const products = await productRepository.find(
      { $expr: { $lte: ['$stock', '$lowStockThreshold'] } },
      { sort: { stock: 1 }, populate: 'brand', lean: true }
    );
    return products.map((p) => ({
      _id: p._id,
      name: p.name,
      sku: p.sku,
      slug: p.slug,
      image: p.images?.[0],
      stock: p.stock,
      lowStockThreshold: p.lowStockThreshold,
      brand: p.brand?.name,
      status: p.stock === 0 ? 'out_of_stock' : 'low',
    }));
  },

  /** Sales report rows for export/table between two dates. */
  async salesReport({ from, to }) {
    const match = { ...PAID_MATCH };
    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = new Date(from);
      if (to) match.createdAt.$lte = new Date(to);
    }
    const [summary, byDay] = await Promise.all([
      orderRepository.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            revenue: { $sum: '$pricing.total' },
            orders: { $sum: 1 },
            discount: { $sum: '$pricing.discount' },
            items: { $sum: { $size: '$items' } },
          },
        },
      ]),
      analyticsService.revenueSeries('90d'),
    ]);
    const s = summary[0] || { revenue: 0, orders: 0, discount: 0, items: 0 };
    return {
      summary: {
        revenue: Math.round(s.revenue),
        orders: s.orders,
        discount: Math.round(s.discount),
        items: s.items,
      },
      byDay,
    };
  },

  /** Rating + review moderation snapshot. */
  async reviewStats() {
    const rows = await reviewRepository.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    const map = Object.fromEntries(rows.map((r) => [r._id, r.count]));
    return { pending: map.pending || 0, approved: map.approved || 0, rejected: map.rejected || 0 };
  },
};

export default analyticsService;
