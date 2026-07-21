/** Admin API endpoints. Response transforms keep page components envelope-free. */
import { baseApi } from '@/services/baseApi';

const list = (res) => ({ items: res.data, meta: res.meta });
const data = (res) => res.data;

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query({ query: () => ({ url: '/admin/analytics/dashboard' }), transformResponse: data, providesTags: ['Admin'] }),
    getRevenue: builder.query({ query: (range = '30d') => ({ url: '/admin/analytics/revenue', params: { range } }), transformResponse: data }),
    getCategorySplit: builder.query({ query: (range = '30d') => ({ url: '/admin/analytics/category-split', params: { range } }), transformResponse: data }),
    getOrderStatus: builder.query({ query: () => ({ url: '/admin/analytics/order-status' }), transformResponse: data }),
    getTopProducts: builder.query({ query: (range = '30d') => ({ url: '/admin/analytics/top-products', params: { range } }), transformResponse: data }),
    getAdminOrders: builder.query({ query: (params) => ({ url: '/admin/orders', params }), transformResponse: list, providesTags: ['Admin', 'Order'] }),
    updateAdminOrder: builder.mutation({ query: ({ id, ...body }) => ({ url: `/admin/orders/${id}/status`, method: 'patch', data: body }), invalidatesTags: ['Admin', 'Order'] }),
    getAdminReturns: builder.query({ query: (params) => ({ url: '/admin/returns', params }), transformResponse: list, providesTags: ['Admin', 'Return'] }),
    updateAdminReturn: builder.mutation({ query: ({ id, ...body }) => ({ url: `/admin/returns/${id}/status`, method: 'patch', data: body }), invalidatesTags: ['Admin', 'Return'] }),
    getAdminReviews: builder.query({ query: (params) => ({ url: '/admin/reviews', params }), transformResponse: list, providesTags: ['Admin', 'Review'] }),
    moderateReview: builder.mutation({ query: ({ id, status }) => ({ url: `/admin/reviews/${id}/moderate`, method: 'patch', data: { status } }), invalidatesTags: ['Admin', 'Review'] }),
    getAdminCoupons: builder.query({ query: () => ({ url: '/admin/coupons' }), transformResponse: data, providesTags: ['Admin', 'Coupon'] }),
    createAdminCoupon: builder.mutation({ query: (body) => ({ url: '/admin/coupons', method: 'post', data: body }), invalidatesTags: ['Admin', 'Coupon'] }),
    updateAdminCoupon: builder.mutation({ query: ({ id, ...body }) => ({ url: `/admin/coupons/${id}`, method: 'patch', data: body }), invalidatesTags: ['Admin', 'Coupon'] }),
    deleteAdminCoupon: builder.mutation({ query: (id) => ({ url: `/admin/coupons/${id}`, method: 'delete' }), invalidatesTags: ['Admin', 'Coupon'] }),
    getAdminBanners: builder.query({ query: () => ({ url: '/admin/banners' }), transformResponse: data, providesTags: ['Admin', 'Banner'] }),
    createAdminBanner: builder.mutation({ query: (body) => ({ url: '/admin/banners', method: 'post', data: body }), invalidatesTags: ['Admin', 'Banner'] }),
    updateAdminBanner: builder.mutation({ query: ({ id, ...body }) => ({ url: `/admin/banners/${id}`, method: 'patch', data: body }), invalidatesTags: ['Admin', 'Banner'] }),
    deleteAdminBanner: builder.mutation({ query: (id) => ({ url: `/admin/banners/${id}`, method: 'delete' }), invalidatesTags: ['Admin', 'Banner'] }),
    getAdminUsers: builder.query({ query: (params) => ({ url: '/admin/users', params }), transformResponse: list, providesTags: ['Admin', 'User'] }),
    setUserActive: builder.mutation({ query: ({ id, isActive }) => ({ url: `/admin/users/${id}/active`, method: 'patch', data: { isActive } }), invalidatesTags: ['Admin', 'User'] }),
    setUserRole: builder.mutation({ query: ({ id, role }) => ({ url: `/admin/users/${id}/role`, method: 'patch', data: { role } }), invalidatesTags: ['Admin', 'User'] }),
    getLowStock: builder.query({ query: () => ({ url: '/admin/inventory/low-stock' }), transformResponse: data, providesTags: ['Admin', 'Product'] }),
    getSalesReport: builder.query({ query: (params) => ({ url: '/admin/reports/sales', params }), transformResponse: data }),
    getSettings: builder.query({ query: () => ({ url: '/admin/settings' }), transformResponse: data, providesTags: ['Admin'] }),
    updateSettings: builder.mutation({ query: (body) => ({ url: '/admin/settings', method: 'patch', data: body }), invalidatesTags: ['Admin'] }),
    createCategory: builder.mutation({ query: (body) => ({ url: '/categories', method: 'post', data: body }), invalidatesTags: ['Admin', 'Category'] }),
    updateCategory: builder.mutation({ query: ({ id, ...body }) => ({ url: `/categories/${id}`, method: 'patch', data: body }), invalidatesTags: ['Admin', 'Category'] }),
    deleteCategory: builder.mutation({ query: (id) => ({ url: `/categories/${id}`, method: 'delete' }), invalidatesTags: ['Admin', 'Category'] }),
    createBrand: builder.mutation({ query: (body) => ({ url: '/brands', method: 'post', data: body }), invalidatesTags: ['Admin', 'Brand'] }),
    updateBrand: builder.mutation({ query: ({ id, ...body }) => ({ url: `/brands/${id}`, method: 'patch', data: body }), invalidatesTags: ['Admin', 'Brand'] }),
    deleteBrand: builder.mutation({ query: (id) => ({ url: `/brands/${id}`, method: 'delete' }), invalidatesTags: ['Admin', 'Brand'] }),
  }),
});

export const {
  useGetDashboardQuery, useGetRevenueQuery, useGetCategorySplitQuery, useGetOrderStatusQuery, useGetTopProductsQuery,
  useGetAdminOrdersQuery, useUpdateAdminOrderMutation, useGetAdminReturnsQuery, useUpdateAdminReturnMutation,
  useGetAdminReviewsQuery, useModerateReviewMutation, useGetAdminCouponsQuery, useCreateAdminCouponMutation,
  useUpdateAdminCouponMutation, useDeleteAdminCouponMutation, useGetAdminBannersQuery, useCreateAdminBannerMutation,
  useUpdateAdminBannerMutation, useDeleteAdminBannerMutation, useGetAdminUsersQuery, useSetUserActiveMutation,
  useSetUserRoleMutation, useGetLowStockQuery, useGetSalesReportQuery, useGetSettingsQuery, useUpdateSettingsMutation,
  useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation, useCreateBrandMutation,
  useUpdateBrandMutation, useDeleteBrandMutation,
} = adminApi;
