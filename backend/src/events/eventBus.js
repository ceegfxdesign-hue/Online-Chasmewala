import { EventEmitter } from 'node:events';
import { logger } from '../config/logger.js';

/**
 * In-process event bus decoupling side effects (notifications, inventory,
 * analytics) from the request flow. Handlers are registered in
 * events/handlers.js and wired at boot.
 */
class AppEventBus extends EventEmitter {
  emitEvent(event, payload) {
    logger.debug(`event: ${event}`);
    this.emit(event, payload);
  }
}

export const eventBus = new AppEventBus();

export const EVENTS = Object.freeze({
  ORDER_PLACED: 'order.placed',
  ORDER_STATUS_CHANGED: 'order.status_changed',
  ORDER_CANCELLED: 'order.cancelled',
  RETURN_REQUESTED: 'return.requested',
  RETURN_STATUS_CHANGED: 'return.status_changed',
  REVIEW_CREATED: 'review.created',
  USER_REGISTERED: 'user.registered',
  LOW_STOCK: 'inventory.low_stock',
});

export default eventBus;
