import { layout, paragraph, rows, money } from './layout.js';
export function orderCancelled({ order, refund, reason, baseUrl }) {
  return layout(`${refund ? 'Return / refund update' : 'Order cancelled'} · ${order.orderNumber}`, paragraph(refund ? 'Your return request has been updated.' : 'Your order has been cancelled.') + rows([
    ['Reason', reason || order.cancelReason || order.timeline?.at(-1)?.note || 'Not specified'],
    ['Refund amount', refund ? money(refund.amount) : order.payment.status === 'refunded' ? money(order.pricing.total) : 'Eligibility to be confirmed; no refund for unpaid COD orders'],
    ['Refund status', refund?.status || (order.payment.status === 'refunded' ? 'Recorded as refunded by the store; bank settlement may take additional time' : 'Contact support for payment/refund details')],
  ]), baseUrl);
}
