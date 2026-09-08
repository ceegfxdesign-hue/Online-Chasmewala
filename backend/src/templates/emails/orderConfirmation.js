import { layout, paragraph, rows, button, escapeHtml, safeUrl, money } from './layout.js';

export function opticalSummary(prescription) {
  if (!prescription) return '';
  if (prescription.method === 'upload') return paragraph('Prescription uploaded. Your document is available in your order details.');
  const values = prescription.values instanceof Map ? Object.fromEntries(prescription.values) : prescription.values || {};
  if (!Object.keys(values).length) return '';
  const keys = [...new Set(['sph', 'cyl', 'axis', 'pd', ...Object.keys(values).map((k) => k.split(':').at(-1))])];
  return `<h3>Optical Power Summary</h3><table width="100%" cellpadding="6" style="border-collapse:collapse;border:1px solid #e2e8f0"><tr><th>Field</th><th>Right Eye (OD)</th><th>Left Eye (OS)</th></tr>${keys.map((key) => `<tr><th>${escapeHtml(key.toUpperCase())}</th>${['rightEye', 'leftEye'].map((eye) => `<td align="center">${escapeHtml(values[`${eye}:${key}`] ?? values[key] ?? '—')}</td>`).join('')}</tr>`).join('')}</table>`;
}

export function orderConfirmation({ order, user, baseUrl }) {
  const lensTotal = order.items.reduce((total, item) => total + (item.lensOption?.price || 0) * item.quantity, 0);
  const items = order.items.map((item) => `<section style="border-bottom:1px solid #e2e8f0;padding:16px 0">${safeUrl(item.image) ? `<img src="${safeUrl(item.image)}" alt="${escapeHtml(item.name)}" width="100">` : ''}<h3>${escapeHtml(item.name)}</h3>${rows([
    ['Color / variant', item.color || 'Standard'], ['Quantity', item.quantity], ['Frame unit price', money(item.price)],
    ['Selected lens package', item.lensOption?.label || 'Frame only'], ['Lens add-on per unit', money(item.lensOption?.price)],
  ])}${opticalSummary(item.prescription)}</section>`).join('');
  const p = order.pricing;
  const address = Object.values(order.shippingAddress?.toObject?.() || order.shippingAddress || {}).filter(Boolean).join(', ');
  return layout(`Order confirmation · ${order.orderNumber}`, paragraph(`Thank you, ${user.name}! Your order is confirmed.`) + items + '<h3>Price breakdown</h3>' + rows([
    ['Frames subtotal', money(p.subtotal - lensTotal)], ['Lens package add-ons', money(lensTotal)], ['Subtotal (including lenses)', money(p.subtotal)],
    ['Discount', money(p.discount)], ['Shipping fee', money(p.shippingFee)], ['Tax', money(p.tax)], ['Order total', money(p.total)],
    [order.payment.status === 'paid' ? 'Total paid' : 'Amount due', money(p.total)],
    ['Payment method', order.payment.method === 'cod' ? 'Cash on delivery' : order.payment.method],
  ]) + '<h3>Delivery</h3>' + paragraph(address) + paragraph(order.estimatedDeliveryAt ? `Estimated delivery: ${new Date(order.estimatedDeliveryAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}` : 'Delivery estimate will be shared soon.') + button(`${baseUrl}/account/orders/${encodeURIComponent(order.orderNumber)}`, 'View your order'), baseUrl);
}
