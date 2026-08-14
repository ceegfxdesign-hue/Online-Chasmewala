/** Public storefront banner endpoints. */
import { baseApi } from '@/services/baseApi';

export const bannerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getHeroBanners: builder.query({
      query: () => ({ url: '/banners', params: { placement: 'hero' } }),
      transformResponse: (response) => response?.data || [],
      providesTags: ['Banner'],
      keepUnusedDataFor: 300,
    }),
  }),
});

export const { useGetHeroBannersQuery } = bannerApi;

export default bannerApi;
