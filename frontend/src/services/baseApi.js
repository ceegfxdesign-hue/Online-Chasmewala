/**
 * RTK Query base API. Uses the shared axios instance (so token attach/refresh is
 * reused) via a custom baseQuery. Resource endpoints are injected in their own
 * feature files (products, orders, reviews, …) via `injectEndpoints`.
 */
import { createApi } from '@reduxjs/toolkit/query/react';
import { api, normalizeError } from '@/services/api';

const axiosBaseQuery =
  () =>
  async ({ url, method = 'get', data, params }) => {
    try {
      const result = await api({ url, method, data, params });
      return { data: result.data };
    } catch (axiosError) {
      return { error: normalizeError(axiosError) };
    }
  };

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery(),
  tagTypes: [
    'Product',
    'Category',
    'Brand',
    'Cart',
    'Wishlist',
    'Order',
    'Review',
    'Coupon',
    'Return',
    'Notification',
    'Address',
    'Banner',
    'Offer',
    'Admin',
    'User',
  ],
  endpoints: () => ({}),
});

export default baseApi;
