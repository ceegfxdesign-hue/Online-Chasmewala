/**
 * Product & catalog API endpoints injected into the RTK Query base API. Provides
 * cached hooks for listings, facets, details, search and home collections, plus
 * admin mutations.
 */
import { baseApi } from '@/services/baseApi';

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: (params) => ({ url: '/products', params }),
      transformResponse: (res) => ({ items: res.data, meta: res.meta }),
      providesTags: (result) =>
        result
          ? [...result.items.map((p) => ({ type: 'Product', id: p._id })), { type: 'Product', id: 'LIST' }]
          : [{ type: 'Product', id: 'LIST' }],
    }),

    getProductFacets: builder.query({
      query: (params) => ({ url: '/products/facets', params }),
      transformResponse: (res) => res.data,
    }),

    getCollections: builder.query({
      query: () => ({ url: '/products/collections' }),
      transformResponse: (res) => res.data,
    }),

    getSuggestions: builder.query({
      query: (q) => ({ url: '/products/suggest', params: { q } }),
      transformResponse: (res) => res.data,
    }),

    getProductBySlug: builder.query({
      query: (slug) => ({ url: `/products/${slug}` }),
      transformResponse: (res) => res.data,
      providesTags: (result) => (result ? [{ type: 'Product', id: result._id }] : []),
    }),

    getRelatedProducts: builder.query({
      query: (slug) => ({ url: `/products/${slug}/related` }),
      transformResponse: (res) => res.data,
    }),

    getProductReviews: builder.query({
      query: ({ slug, ...params }) => ({ url: `/products/${slug}/reviews`, params }),
      transformResponse: (res) => ({ items: res.data, meta: res.meta }),
      providesTags: (r, e, arg) => [{ type: 'Review', id: arg.slug }],
    }),

    getReviewSummary: builder.query({
      query: (slug) => ({ url: `/products/${slug}/reviews/summary` }),
      transformResponse: (res) => res.data,
      providesTags: (r, e, slug) => [{ type: 'Review', id: `${slug}-summary` }],
    }),

    getCategories: builder.query({
      query: () => ({ url: '/categories' }),
      transformResponse: (res) => res.data,
      providesTags: [{ type: 'Category', id: 'LIST' }],
    }),

    getBrands: builder.query({
      query: (params) => ({ url: '/brands', params }),
      transformResponse: (res) => res.data,
      providesTags: [{ type: 'Brand', id: 'LIST' }],
    }),

    // ── Admin ──────────────────────────────────────────────────────────────
    getAdminProducts: builder.query({
      query: (params) => ({ url: '/products/admin', params }),
      transformResponse: (res) => ({ items: res.data, meta: res.meta }),
      providesTags: [{ type: 'Product', id: 'ADMIN_LIST' }],
    }),
    createProduct: builder.mutation({
      query: (body) => ({ url: '/products', method: 'post', data: body }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }, { type: 'Product', id: 'ADMIN_LIST' }],
    }),
    updateProduct: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/products/${id}`, method: 'patch', data: body }),
      invalidatesTags: (r, e, arg) => [
        { type: 'Product', id: arg.id },
        { type: 'Product', id: 'ADMIN_LIST' },
      ],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({ url: `/products/${id}`, method: 'delete' }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }, { type: 'Product', id: 'ADMIN_LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProductsQuery,
  useGetProductFacetsQuery,
  useGetCollectionsQuery,
  useLazyGetSuggestionsQuery,
  useGetProductBySlugQuery,
  useGetRelatedProductsQuery,
  useGetProductReviewsQuery,
  useGetReviewSummaryQuery,
  useGetCategoriesQuery,
  useGetBrandsQuery,
  useGetAdminProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi;
