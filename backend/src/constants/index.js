/**
 * Application-wide constants. Centralized so magic strings never leak into the
 * codebase and stay consistent between models, services and the frontend.
 */

export const ROLES = Object.freeze({
  USER: 'user',
  ADMIN: 'admin',
});

export const ORDER_STATUS = Object.freeze({
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PACKED: 'packed',
  SHIPPED: 'shipped',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
});

export const ORDER_STATUS_FLOW = Object.freeze([
  ORDER_STATUS.PENDING,
  ORDER_STATUS.CONFIRMED,
  ORDER_STATUS.PACKED,
  ORDER_STATUS.SHIPPED,
  ORDER_STATUS.OUT_FOR_DELIVERY,
  ORDER_STATUS.DELIVERED,
]);

export const PAYMENT_STATUS = Object.freeze({
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
});

export const PAYMENT_METHOD = Object.freeze({
  CARD: 'card',
  UPI: 'upi',
  NETBANKING: 'netbanking',
  COD: 'cod',
  WALLET: 'wallet',
});

export const RETURN_STATUS = Object.freeze({
  REQUESTED: 'requested',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  PICKED_UP: 'picked_up',
  REFUNDED: 'refunded',
  COMPLETED: 'completed',
});

export const RETURN_TYPE = Object.freeze({
  RETURN: 'return',
  EXCHANGE: 'exchange',
});

export const REVIEW_STATUS = Object.freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
});

export const TOKEN_TYPES = Object.freeze({
  ACCESS: 'access',
  REFRESH: 'refresh',
});

export const COUPON_TYPE = Object.freeze({
  PERCENT: 'percentage',
  FLAT: 'flat',
});

export const GENDERS = Object.freeze(['men', 'women', 'unisex', 'kids']);

export const FRAME_SHAPES = Object.freeze([
  'rectangle',
  'square',
  'round',
  'oval',
  'cat-eye',
  'aviator',
  'wayfarer',
  'geometric',
  'clubmaster',
]);

export const FRAME_TYPES = Object.freeze(['full-rim', 'half-rim', 'rimless']);

export const FRAME_MATERIALS = Object.freeze([
  'acetate',
  'metal',
  'tr90',
  'titanium',
  'plastic',
  'mixed',
]);

export const LENS_TYPES = Object.freeze([
  'single-vision',
  'bifocal',
  'progressive',
  'zero-power',
  'blue-light',
  'polarized',
  'photochromic',
  'sunglasses',
]);

export const FACE_SHAPES = Object.freeze([
  'round',
  'oval',
  'square',
  'heart',
  'oblong',
  'diamond',
]);

export const RIM_TYPES = Object.freeze(['full-rim', 'half-rim', 'rimless']);

export const FRAME_SIZES = Object.freeze(['narrow', 'medium', 'wide', 'extra-wide']);

export const PRODUCT_CATEGORIES = Object.freeze([
  'eyeglasses',
  'sunglasses',
  'computer-glasses',
  'contact-lenses',
  'kids-glasses',
  'accessories',
]);

export const MESSAGES = Object.freeze({
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'You do not have permission to perform this action',
  INVALID_CREDENTIALS: 'Invalid email or password',
  VALIDATION_FAILED: 'Validation failed',
  SERVER_ERROR: 'Something went wrong. Please try again later.',
});
