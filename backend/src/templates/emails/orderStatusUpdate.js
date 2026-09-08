import { layout, paragraph, button } from './layout.js';
export function orderStatusUpdate({ order, status, baseUrl }) {
  const copy = {
    confirmed: 'Your frames and lenses are being precision-cut and assembled.',
    processing: 'Your frames and lenses are being precision-cut and assembled.',
    fitting: 'Your frames and lenses are being precision-cut and assembled.',
    packed: 'Your frames and lenses are assembled and packed for dispatch.',
    shipped: 'Your glasses are on the way!', out_for_delivery: 'Your order is out for delivery.',
    delivered: 'Your order has been delivered. Enjoy your new look!',
  };
  return layout(`Order ${order.orderNumber} · ${status.replace(/_/g, ' ')}`, paragraph(copy[status] || `Your order status is ${status}.`) + (order.tracking?.courier ? paragraph(`Courier: ${order.tracking.courier}`) : '') + button(order.tracking?.url, 'Track shipment') + button(`${baseUrl}/account/orders/${encodeURIComponent(order.orderNumber)}`, 'View order'), baseUrl);
}
