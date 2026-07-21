/**
 * Event handlers decoupling side effects from request handling. Registered once
 * at boot via `registerEventHandlers()`. Handlers are intentionally resilient —
 * a failure here must never break the originating request.
 */
import { eventBus, EVENTS } from './eventBus.js';
import { logger } from '../config/logger.js';
import { notificationService } from '../services/notification.service.js';
import { orderRepository } from '../repositories/index.js';

let registered = false;

const safe = (fn) => async (payload) => {
  try {
    await fn(payload);
  } catch (err) {
    logger.error(`Event handler failed: ${err.message}`);
  }
};

export function registerEventHandlers() {
  if (registered) return;
  registered = true;

  eventBus.on(
    EVENTS.USER_REGISTERED,
    safe(async ({ userId }) => {
      logger.info(`New user registered: ${userId}`);
      await notificationService.create({
        user: userId,
        type: 'account',
        title: 'Welcome to Online Chasmewala! 👓',
        message: 'Your account is ready. Enjoy 10% off your first order with code WELCOME10.',
        link: '/products',
      });
    })
  );

  eventBus.on(
    EVENTS.ORDER_PLACED,
    safe(async ({ orderNumber, userId }) => {
      logger.info(`Order placed: ${orderNumber} by ${userId}`);
      await notificationService.create({
        user: userId,
        type: 'order',
        title: 'Order confirmed',
        message: `Your order ${orderNumber} has been confirmed. We'll notify you when it ships.`,
        link: `/account/orders/${orderNumber}`,
      });
    })
  );

  eventBus.on(
    EVENTS.ORDER_STATUS_CHANGED,
    safe(async ({ orderId, status }) => {
      const order = await orderRepository.findById(orderId).select('orderNumber user');
      if (!order) return;
      const labels = {
        packed: 'Your order has been packed',
        shipped: 'Your order is on its way 🚚',
        out_for_delivery: 'Your order is out for delivery',
        delivered: 'Your order has been delivered 🎉',
        cancelled: 'Your order was cancelled',
      };
      if (!labels[status]) return;
      await notificationService.create({
        user: order.user,
        type: 'order',
        title: labels[status],
        message: `Order ${order.orderNumber} is now ${status.replace(/_/g, ' ')}.`,
        link: `/account/orders/${order.orderNumber}`,
      });
    })
  );

  eventBus.on(
    EVENTS.RETURN_REQUESTED,
    safe(async ({ userId, returnNumber }) => {
      await notificationService.create({
        user: userId,
        type: 'return',
        title: 'Return request received',
        message: `We've received your request ${returnNumber}. Our team will review it shortly.`,
        link: '/account/returns',
      });
    })
  );

  eventBus.on(
    EVENTS.RETURN_STATUS_CHANGED,
    safe(async ({ userId, returnNumber, status }) => {
      await notificationService.create({
        user: userId,
        type: 'return',
        title: 'Return request updated',
        message: `Your return request ${returnNumber} is now ${status.replace(/_/g, ' ')}.`,
        link: '/account/returns',
      });
    })
  );

  eventBus.on(
    EVENTS.ORDER_CANCELLED,
    safe(async ({ orderNumber, userId }) => {
      await notificationService.create({
        user: userId,
        type: 'order',
        title: 'Order cancelled',
        message: `Your order ${orderNumber} has been cancelled. Any eligible refund is being processed.`,
        link: `/account/orders/${orderNumber}`,
      });
    })
  );

  eventBus.on(
    EVENTS.REVIEW_CREATED,
    safe(async ({ reviewId, productId, userId }) => {
      logger.info(`Review ${reviewId} created for product ${productId} by ${userId}`);
    })
  );

  eventBus.on(EVENTS.LOW_STOCK, ({ productId, stock }) => {
    logger.warn(`Low stock for product ${productId}: ${stock} left`);
  });
}

export default registerEventHandlers;
