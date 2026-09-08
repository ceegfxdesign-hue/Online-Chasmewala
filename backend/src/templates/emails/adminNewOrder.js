import { layout, rows, money, button } from './layout.js';
export function adminNewOrder({ order, user, baseUrl }) {
  return layout(`New order · ${order.orderNumber}`, rows([
    ['Customer', user.name], ['Email', user.email], ['Phone', order.shippingAddress?.phone || user.phone || 'Not provided'],
    ['Order total', money(order.pricing.total)], ['Payment', order.payment.method === 'cod' ? 'COD' : `Prepaid (${order.payment.method})`],
    ['Payment status', order.payment.status],
  ]) + button(`${baseUrl}/admin/orders`, 'Open Admin Orders'), baseUrl);
}
