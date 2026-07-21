/**
 * Server cart, wishlist, coupon and order endpoints. These are used for
 * authenticated users; guest state lives in the cart/wishlist slices and is
 * merged server-side on login.
 */
import { baseApi } from '@/services/baseApi';

export const cartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getServerCart: builder.query({
      query: () => ({ url: '/cart' }),
      transformResponse: (res) => res.data,
      providesTags: [{ type: 'Cart', id: 'ME' }],
    }),
    addServerCartItem: builder.mutation({
      query: (body) => ({ url: '/cart/items', method: 'post', data: body }),
      transformResponse: (res) => res.data,
      invalidatesTags: [{ type: 'Cart', id: 'ME' }],
    }),
    updateServerCartItem: builder.mutation({
      query: ({ itemId, quantity }) => ({ url: `/cart/items/${itemId}`, method: 'patch', data: { quantity } }),
      transformResponse: (res) => res.data,
      invalidatesTags: [{ type: 'Cart', id: 'ME' }],
    }),
    removeServerCartItem: builder.mutation({
      query: (itemId) => ({ url: `/cart/items/${itemId}`, method: 'delete' }),
      transformResponse: (res) => res.data,
      invalidatesTags: [{ type: 'Cart', id: 'ME' }],
    }),
    mergeCart: builder.mutation({
      query: (items) => ({ url: '/cart/merge', method: 'post', data: { items } }),
      transformResponse: (res) => res.data,
      invalidatesTags: [{ type: 'Cart', id: 'ME' }],
    }),
    clearServerCart: builder.mutation({
      query: () => ({ url: '/cart', method: 'delete' }),
      transformResponse: (res) => res.data,
      invalidatesTags: [{ type: 'Cart', id: 'ME' }],
    }),

    // Wishlist
    getServerWishlist: builder.query({
      query: () => ({ url: '/wishlist' }),
      transformResponse: (res) => res.data,
      providesTags: [{ type: 'Wishlist', id: 'ME' }],
    }),
    toggleServerWishlist: builder.mutation({
      query: (productId) => ({ url: '/wishlist/toggle', method: 'post', data: { productId } }),
      transformResponse: (res) => res.data,
      invalidatesTags: [{ type: 'Wishlist', id: 'ME' }],
    }),
    mergeWishlist: builder.mutation({
      query: (productIds) => ({ url: '/wishlist/merge', method: 'post', data: { productIds } }),
      transformResponse: (res) => res.data,
      invalidatesTags: [{ type: 'Wishlist', id: 'ME' }],
    }),

    // Coupons
    getActiveCoupons: builder.query({
      query: () => ({ url: '/coupons' }),
      transformResponse: (res) => res.data,
      providesTags: [{ type: 'Coupon', id: 'LIST' }],
    }),
    validateCoupon: builder.mutation({
      query: (body) => ({ url: '/coupons/validate', method: 'post', data: body }),
      transformResponse: (res) => res.data,
    }),
    getOffers: builder.query({
      query: () => ({ url: '/offers' }),
      transformResponse: (res) => res.data,
      providesTags: [{ type: 'Offer', id: 'LIST' }],
    }),

    // Orders
    quoteOrder: builder.mutation({
      query: (body) => ({ url: '/orders/quote', method: 'post', data: body }),
      transformResponse: (res) => res.data,
    }),
    placeOrder: builder.mutation({
      query: (body) => ({ url: '/orders', method: 'post', data: body }),
      transformResponse: (res) => res.data,
      invalidatesTags: [{ type: 'Cart', id: 'ME' }, { type: 'Order', id: 'LIST' }],
    }),
    getMyOrders: builder.query({
      query: (params) => ({ url: '/orders', params }),
      transformResponse: (res) => ({ items: res.data, meta: res.meta }),
      providesTags: [{ type: 'Order', id: 'LIST' }],
    }),
    getOrder: builder.query({
      query: (orderNumber) => ({ url: `/orders/${orderNumber}` }),
      transformResponse: (res) => res.data,
      providesTags: (r, e, arg) => [{ type: 'Order', id: arg }],
    }),
    cancelOrder: builder.mutation({
      query: ({ orderNumber, reason }) => ({ url: `/orders/${orderNumber}/cancel`, method: 'post', data: { reason } }),
      transformResponse: (res) => res.data,
      invalidatesTags: (r, e, arg) => [{ type: 'Order', id: arg.orderNumber }, { type: 'Order', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetServerCartQuery,
  useAddServerCartItemMutation,
  useUpdateServerCartItemMutation,
  useRemoveServerCartItemMutation,
  useMergeCartMutation,
  useClearServerCartMutation,
  useGetServerWishlistQuery,
  useToggleServerWishlistMutation,
  useMergeWishlistMutation,
  useGetActiveCouponsQuery,
  useValidateCouponMutation,
  useGetOffersQuery,
  useQuoteOrderMutation,
  usePlaceOrderMutation,
  useGetMyOrdersQuery,
  useGetOrderQuery,
  useCancelOrderMutation,
} = cartApi;
