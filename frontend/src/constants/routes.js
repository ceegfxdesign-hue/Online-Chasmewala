/** Centralized route paths — import these instead of hardcoding strings. */
export const ROUTES = Object.freeze({
  home: '/',
  products: '/products',
  product: (slug = ':slug') => `/product/${slug}`,
  category: (slug = ':slug') => `/category/${slug}`,
  search: '/search',
  cart: '/cart',
  wishlist: '/wishlist',
  compare: '/compare',
  checkout: '/checkout',
  orderSuccess: (id = ':orderNumber') => `/order/success/${id}`,
  orderFailed: '/order/failed',

  // Auth
  login: '/login',
  signup: '/signup',
  forgotPassword: '/forgot-password',
  otp: '/verify-otp',
  resetPassword: '/reset-password',

  // Account
  account: '/account',
  profile: '/account/profile',
  orders: '/account/orders',
  orderDetails: (id = ':orderNumber') => `/account/orders/${id}`,
  addresses: '/account/addresses',
  cards: '/account/cards',
  coupons: '/account/coupons',
  notifications: '/account/notifications',
  returns: '/account/returns',
  reviews: '/account/reviews',
  settings: '/account/settings',

  // Admin
  admin: '/admin',
  adminProducts: '/admin/products',
  adminOrders: '/admin/orders',
  adminCategories: '/admin/categories',
  adminBrands: '/admin/brands',
  adminCoupons: '/admin/coupons',
  adminBanners: '/admin/banners',
  adminUsers: '/admin/users',
  adminReviews: '/admin/reviews',
  adminReturns: '/admin/returns',
  adminInventory: '/admin/inventory',
  adminReports: '/admin/reports',
  adminSettings: '/admin/settings',

  // Static
  about: '/about',
  contact: '/contact',
  faq: '/faq',
  privacy: '/privacy-policy',
  terms: '/terms',
  refund: '/refund-policy',
});

export default ROUTES;
