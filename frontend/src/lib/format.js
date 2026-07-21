/**
 * Formatting helpers for currency, numbers, dates and text.
 */

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

/** Format a number as Indian Rupees, e.g. 1299 → "₹1,299". */
export const formatPrice = (value) => inr.format(Number(value) || 0);

/** Compact number, e.g. 12500 → "12.5K". */
export const formatCompact = (value) =>
  new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(
    Number(value) || 0
  );

/** Percentage discount from mrp → price. */
export const discountPercent = (mrp, price) => {
  const m = Number(mrp);
  const p = Number(price);
  if (!m || m <= p) return 0;
  return Math.round(((m - p) / m) * 100);
};

/** Human-readable date, e.g. "11 Jul 2026". */
export const formatDate = (date) =>
  new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(
    new Date(date)
  );

/** Date + time, e.g. "11 Jul 2026, 8:20 PM". */
export const formatDateTime = (date) =>
  new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date));

/** Truncate text to n chars with an ellipsis. */
export const truncate = (text = '', n = 60) =>
  text.length > n ? `${text.slice(0, n).trimEnd()}…` : text;

/** Title-case a hyphen/space separated slug, e.g. "cat-eye" → "Cat Eye". */
export const titleCase = (str = '') =>
  str
    .replace(/[-_]/g, ' ')
    .replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
