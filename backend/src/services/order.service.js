/**
 * Order business logic: builds an order from the user's cart, applies a coupon,
 * processes (mock) payment, decrements inventory via the event bus, and exposes
 * order retrieval + admin management.
 */
import {
  orderRepository,
  cartRepository,
  productRepository,
  settingsRepository,
} from '../repositories/index.js';
import { cartService } from './cart.service.js';
import { couponService } from './coupon.service.js';
import { paymentProvider } from './providers/paymentProvider.js';
import { ApiError } from '../utils/ApiError.js';
import { getPagination, buildMeta } from '../utils/pagination.js';
import { ORDER_STATUS, PAYMENT_STATUS, ORDER_STATUS_FLOW } from '../constants/index.js';
import { eventBus, EVENTS } from '../events/eventBus.js';

async function getSettings() {
  const doc = await settingsRepository.findOne({ key: 'global' });
  return (
    doc || {
      freeShippingThreshold: 999,
      standardShippingFee: 49,
      expressShippingFee: 129,
      taxPercent: 0,
    }
  );
}

/** Compute shipping + tax + total for a subtotal, after discount. */
function priceOrder({ subtotal, discount, deliveryMethod, settings }) {
  const afterDiscount = Math.max(0, subtotal - discount);
  let shippingFee = 0;
  if (deliveryMethod === 'express') shippingFee = settings.expressShippingFee;
  else if (afterDiscount < settings.freeShippingThreshold) shippingFee = settings.standardShippingFee;

  const tax = Math.round((afterDiscount * (settings.taxPercent || 0)) / 100);
  const total = afterDiscount + shippingFee + tax;
  return { shippingFee, tax, total };
}

export const orderService = {
  /** Preview pricing without creating an order (used by the checkout summary). */
  async quote(userId, { couponCode, deliveryMethod = 'standard' } = {}) {
    const cart = await cartService.get(userId);
    if (!cart.items.length) throw ApiError.badRequest('Your cart is empty');

    const subtotal = cart.summary.subtotal;
    let discount = 0;
    let coupon = null;
    if (couponCode) {
      const res = await couponService.validate({ code: couponCode, subtotal, userId });
      discount = res.discount;
      coupon = res.coupon.code;
    }
    const settings = await getSettings();
    const { shippingFee, tax, total } = priceOrder({ subtotal, discount, deliveryMethod, settings });

    return {
      items: cart.items,
      pricing: { subtotal, discount, couponCode: coupon, shippingFee, tax, total, savings: cart.summary.savings + discount },
      deliveryMethod,
      freeShippingThreshold: settings.freeShippingThreshold,
    };
  },

  async create(userId, payload) {
    const { shippingAddress, deliveryMethod = 'standard', couponCode, paymentMethod, paymentToken } = payload;

    const cart = await cartRepository.findOne({ user: userId });
    if (!cart || cart.items.length === 0) throw ApiError.badRequest('Your cart is empty');

    const hydrated = await cartService.get(userId);
    // Stock guard
    for (const item of hydrated.items) {
      if (!item.inStock) throw ApiError.badRequest(`${item.product.name} is out of stock`);
    }

    const subtotal = hydrated.summary.subtotal;
    let discount = 0;
    let appliedCoupon;
    if (couponCode) {
      const res = await couponService.validate({ code: couponCode, subtotal, userId });
      discount = res.discount;
      appliedCoupon = res.coupon.code;
    }

    const settings = await getSettings();
    const { shippingFee, tax, total } = priceOrder({ subtotal, discount, deliveryMethod, settings });

    // Build order items as snapshots.
    const items = hydrated.items.map((i) => ({
      product: i.product._id,
      name: i.product.name,
      slug: i.product.slug,
      image: i.product.image,
      color: i.color,
      quantity: i.quantity,
      price: i.basePrice,
      lensOption: i.lensOption,
    }));

    const estimatedDeliveryAt = new Date();
    estimatedDeliveryAt.setDate(estimatedDeliveryAt.getDate() + (deliveryMethod === 'express' ? 3 : 6));

    // Create the order (pending) first so we have an order number for payment.
    const order = await orderRepository.create({
      user: userId,
      items,
      shippingAddress,
      pricing: { subtotal, discount, couponCode: appliedCoupon, shippingFee, tax, total },
      payment: { method: paymentMethod, status: PAYMENT_STATUS.PENDING },
      deliveryMethod,
      estimatedDeliveryAt,
      status: ORDER_STATUS.PENDING,
    });

    // Process payment. COD is confirmed without capture.
    let paid = paymentMethod === 'cod';
    if (paymentMethod !== 'cod') {
      const result = await paymentProvider.capture({
        orderNumber: order.orderNumber,
        method: paymentMethod,
        token: paymentToken,
        amount: total,
      });
      paid = result.status === 'paid';
      order.payment.status = paid ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.FAILED;
      order.payment.transactionId = result.transactionId;
      order.payment.provider = result.provider;
      if (paid) order.payment.paidAt = result.paidAt || new Date();
    }

    if (!paid && paymentMethod !== 'cod') {
      order.status = ORDER_STATUS.PENDING;
      await order.save();
      throw new ApiError(402, 'Payment failed. Please try another method.', [
        { field: 'payment', message: 'Payment was declined' },
      ]);
    }

    // Confirm order.
    order.status = ORDER_STATUS.CONFIRMED;
    order.timeline.push({ status: ORDER_STATUS.CONFIRMED, note: paymentMethod === 'cod' ? 'Order confirmed (COD)' : 'Payment received' });
    await order.save();

    // Decrement stock + record sales; emit event for notifications/inventory.
    await Promise.all(
      items.map((i) =>
        productRepository.model.updateOne(
          { _id: i.product },
          { $inc: { stock: -i.quantity, soldCount: i.quantity } }
        )
      )
    );

    const updatedProducts = await Promise.all(items.map((item) => productRepository.findById(item.product)));
    updatedProducts.forEach((product) => {
      if (product && product.stock <= product.lowStockThreshold) {
        eventBus.emitEvent(EVENTS.LOW_STOCK, { productId: product._id, stock: product.stock });
      }
    });

    if (appliedCoupon) await couponService.redeem({ code: appliedCoupon, userId });

    // Clear the cart.
    cart.items = [];
    cart.coupon = undefined;
    await cart.save();

    eventBus.emitEvent(EVENTS.ORDER_PLACED, { orderNumber: order.orderNumber, userId, orderId: order._id });

    return order.toObject();
  },

  async listMine(userId, query = {}) {
    const { page, limit, skip } = getPagination(query, { defaultLimit: 10, maxLimit: 50 });
    const filter = { user: userId };
    if (query.status) filter.status = query.status;
    const { data, total } = await orderRepository.paginate(filter, { sort: { createdAt: -1 }, skip, limit });
    return { data, meta: buildMeta({ page, limit, total }) };
  },

  async getMine(userId, orderNumber) {
    const order = await orderRepository.findByNumber(orderNumber, { user: userId });
    if (!order) throw ApiError.notFound('Order not found');
    return order.toObject();
  },

  async cancel(userId, orderNumber, reason) {
    const order = await orderRepository.findByNumber(orderNumber, { user: userId });
    if (!order) throw ApiError.notFound('Order not found');
    if ([ORDER_STATUS.SHIPPED, ORDER_STATUS.OUT_FOR_DELIVERY, ORDER_STATUS.DELIVERED].includes(order.status)) {
      throw ApiError.badRequest('This order can no longer be cancelled');
    }
    if (order.status === ORDER_STATUS.CANCELLED) throw ApiError.badRequest('Order is already cancelled');

    order.status = ORDER_STATUS.CANCELLED;
    order.cancelledAt = new Date();
    order.cancelReason = reason;
    order.timeline.push({ status: ORDER_STATUS.CANCELLED, note: reason || 'Cancelled by customer' });
    if (order.payment.status === PAYMENT_STATUS.PAID) order.payment.status = PAYMENT_STATUS.REFUNDED;
    await order.save();

    // Restock.
    await Promise.all(
      order.items.map((i) =>
        productRepository.model.updateOne({ _id: i.product }, { $inc: { stock: i.quantity, soldCount: -i.quantity } })
      )
    );
    eventBus.emitEvent(EVENTS.ORDER_CANCELLED, { orderNumber: order.orderNumber, userId, orderId: order._id });
    return order.toObject();
  },

  // ── Admin ──────────────────────────────────────────────────────────────────
  async adminList(query = {}) {
    const { page, limit, skip } = getPagination(query, { defaultLimit: 20, maxLimit: 100 });
    const filter = {};
    if (query.status) filter.status = query.status;
    if (query.search) filter.orderNumber = new RegExp(query.search, 'i');
    const { data, total } = await orderRepository.paginate(filter, {
      sort: { createdAt: -1 },
      skip,
      limit,
      populate: { path: 'user', select: 'name email' },
    });
    return { data, meta: buildMeta({ page, limit, total }) };
  },

  async updateStatus(orderId, status, note) {
    if (!ORDER_STATUS_FLOW.includes(status) && status !== ORDER_STATUS.CANCELLED) {
      throw ApiError.badRequest('Invalid order status');
    }
    const order = await orderRepository.findById(orderId);
    if (!order) throw ApiError.notFound('Order not found');
    order.status = status;
    order.timeline.push({ status, note });
    if (status === ORDER_STATUS.DELIVERED) {
      order.deliveredAt = new Date();
      if (order.payment.method === 'cod') order.payment.status = PAYMENT_STATUS.PAID;
    }
    await order.save();
    eventBus.emitEvent(EVENTS.ORDER_STATUS_CHANGED, { orderId, status });
    return order.toObject();
  },
};

export default orderService;
