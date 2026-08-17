import { baseApi } from '@/services/baseApi';

const data = (response) => response.data;

/** Public storefront configuration. Admin-only updates remain in adminApi. */
export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAnnouncements: builder.query({
      query: () => ({ url: '/settings/announcements' }),
      transformResponse: data,
      providesTags: ['Admin'],
      keepUnusedDataFor: 300,
    }),
    getHomeCategoryImages: builder.query({
      query: () => ({ url: '/settings/home-category-images' }),
      transformResponse: data,
      providesTags: ['Admin'],
      keepUnusedDataFor: 300,
    }),
    getFooterSettings: builder.query({
      query: () => ({ url: '/settings/footer' }),
      transformResponse: data,
      providesTags: ['Admin'],
      keepUnusedDataFor: 300,
    }),
    getTrustBenefits: builder.query({
      query: () => ({ url: '/settings/trust-benefits' }),
      transformResponse: data,
      providesTags: ['Admin'],
      keepUnusedDataFor: 300,
    }),
  }),
});

export const {
  useGetAnnouncementsQuery,
  useGetHomeCategoryImagesQuery,
  useGetFooterSettingsQuery,
  useGetTrustBenefitsQuery,
} = settingsApi;
