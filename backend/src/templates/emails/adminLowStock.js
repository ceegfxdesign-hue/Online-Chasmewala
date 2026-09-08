import { layout, rows, button } from './layout.js';
export function adminLowStock({ product, stock, baseUrl }) {
  return layout('Low-stock inventory alert', rows([['Frame', product.name], ['SKU', product.sku || 'Not set'], ['Remaining stock', stock], ['Alert threshold', product.lowStockThreshold]]) + button(`${baseUrl}/admin/inventory`, 'Replenish inventory'), baseUrl);
}
