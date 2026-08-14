import { baseApi } from '@/services/baseApi';

const data = (response) => response.data;

/** Public storefront configuration. Admin-only updates remain in adminApi. */
export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getHomeCategoryImages: builder.query({
      query: () => ({ url: '/settings/home-category-images' }),
      transformResponse: data,
      providesTags: ['Admin'],
    }),
    getFooterSettings: builder.query({
      query: () => ({ url: '/settings/footer' }),
      transformResponse: data,
      providesTags: ['Admin'],
    }),
    getTrustBenefits: builder.query({
      query: () => ({ url: '/settings/trust-benefits' }),
      transformResponse: data,
      providesTags: ['Admin'],
    }),
  }),
});

export const { useGetHomeCategoryImagesQuery, useGetFooterSettingsQuery, useGetTrustBenefitsQuery } = settingsApi;
