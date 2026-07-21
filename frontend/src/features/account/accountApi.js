/**
 * Account endpoints: profile, password, addresses, cards, returns,
 * notifications and my reviews.
 */
import { baseApi } from '@/services/baseApi';

export const accountApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    updateProfile: builder.mutation({
      query: (body) => ({ url: '/account/profile', method: 'patch', data: body }),
      transformResponse: (res) => res.data,
    }),
    changePassword: builder.mutation({
      query: (body) => ({ url: '/account/change-password', method: 'post', data: body }),
      transformResponse: (res) => res.data,
    }),

    // Addresses
    getAddresses: builder.query({
      query: () => ({ url: '/account/addresses' }),
      transformResponse: (res) => res.data,
      providesTags: [{ type: 'Address', id: 'LIST' }],
    }),
    addAddress: builder.mutation({
      query: (body) => ({ url: '/account/addresses', method: 'post', data: body }),
      invalidatesTags: [{ type: 'Address', id: 'LIST' }],
    }),
    updateAddress: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/account/addresses/${id}`, method: 'patch', data: body }),
      invalidatesTags: [{ type: 'Address', id: 'LIST' }],
    }),
    removeAddress: builder.mutation({
      query: (id) => ({ url: `/account/addresses/${id}`, method: 'delete' }),
      invalidatesTags: [{ type: 'Address', id: 'LIST' }],
    }),

    // Cards
    getCards: builder.query({
      query: () => ({ url: '/account/cards' }),
      transformResponse: (res) => res.data,
      providesTags: [{ type: 'User', id: 'CARDS' }],
    }),
    addCard: builder.mutation({
      query: (body) => ({ url: '/account/cards', method: 'post', data: body }),
      invalidatesTags: [{ type: 'User', id: 'CARDS' }],
    }),
    removeCard: builder.mutation({
      query: (id) => ({ url: `/account/cards/${id}`, method: 'delete' }),
      invalidatesTags: [{ type: 'User', id: 'CARDS' }],
    }),

    // Returns
    createReturn: builder.mutation({
      query: (body) => ({ url: '/account/returns', method: 'post', data: body }),
      invalidatesTags: [{ type: 'Return', id: 'LIST' }],
    }),
    getMyReturns: builder.query({
      query: (params) => ({ url: '/account/returns', params }),
      transformResponse: (res) => ({ items: res.data, meta: res.meta }),
      providesTags: [{ type: 'Return', id: 'LIST' }],
    }),

    // Notifications
    getNotifications: builder.query({
      query: (params) => ({ url: '/account/notifications', params }),
      transformResponse: (res) => ({ items: res.data, meta: res.meta }),
      providesTags: [{ type: 'Notification', id: 'LIST' }],
    }),
    markNotificationRead: builder.mutation({
      query: (id) => ({ url: `/account/notifications/${id}/read`, method: 'patch' }),
      invalidatesTags: [{ type: 'Notification', id: 'LIST' }],
    }),
    markAllNotificationsRead: builder.mutation({
      query: () => ({ url: '/account/notifications/read-all', method: 'post' }),
      invalidatesTags: [{ type: 'Notification', id: 'LIST' }],
    }),
    removeNotification: builder.mutation({
      query: (id) => ({ url: `/account/notifications/${id}`, method: 'delete' }),
      invalidatesTags: [{ type: 'Notification', id: 'LIST' }],
    }),

    // My reviews
    getMyReviews: builder.query({
      query: (params) => ({ url: '/account/reviews', params }),
      transformResponse: (res) => ({ items: res.data, meta: res.meta }),
      providesTags: [{ type: 'Review', id: 'MINE' }],
    }),
    removeMyReview: builder.mutation({
      query: (id) => ({ url: `/account/reviews/${id}`, method: 'delete' }),
      invalidatesTags: [{ type: 'Review', id: 'MINE' }],
    }),

    // Write a product review (from order details / product page)
    createReview: builder.mutation({
      query: ({ slug, ...body }) => ({ url: `/products/${slug}/reviews`, method: 'post', data: body }),
      invalidatesTags: (r, e, arg) => [
        { type: 'Review', id: arg.slug },
        { type: 'Review', id: `${arg.slug}-summary` },
        { type: 'Review', id: 'MINE' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useGetAddressesQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useRemoveAddressMutation,
  useGetCardsQuery,
  useAddCardMutation,
  useRemoveCardMutation,
  useCreateReturnMutation,
  useGetMyReturnsQuery,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useRemoveNotificationMutation,
  useGetMyReviewsQuery,
  useRemoveMyReviewMutation,
  useCreateReviewMutation,
} = accountApi;
