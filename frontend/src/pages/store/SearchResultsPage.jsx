import { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';
import { useGetProductsQuery } from '@/features/products/productApi';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Button } from '@/components/ui/Button';
import { SORT_OPTIONS } from '@/constants/filters';
import { staggerContainer } from '@/lib/motion';
import { ROUTES } from '@/constants/routes';

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const sort = searchParams.get('sort') || 'relevance';
  const page = Number(searchParams.get('page')) || 1;

  const params = useMemo(() => ({ search: q, sort, page, limit: 12 }), [q, sort, page]);
  const { data, isFetching } = useGetProductsQuery(params, { skip: !q });

  const items = data?.items || [];
  const meta = data?.meta;

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next, { replace: true });
  };

  return (
    <>
      <Helmet>
        <title>{q ? `Search: ${q}` : 'Search'} · Online Chasmewala</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="container-page py-8">
        {!q ? (
          <EmptyState
            icon={<FiSearch />}
            title="Search Online Chasmewala"
            description="Find frames, sunglasses and brands. Try “aviator”, “blue light” or a brand name."
            action={<Button as={Link} to={ROUTES.products}>Browse all products</Button>}
          />
        ) : (
          <>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-h2 text-navy-900">
                  Results for <span className="text-brand-600">“{q}”</span>
                </h1>
                {meta && <p className="mt-1 text-sm text-navy-400">{meta.total} products found</p>}
              </div>
              <select
                value={sort}
                onChange={(e) => setParam('sort', e.target.value)}
                aria-label="Sort results"
                className="h-11 rounded-xl border border-navy-200 bg-surface px-4 text-sm font-medium text-navy-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    Sort: {o.label}
                  </option>
                ))}
              </select>
            </div>

            {isFetching ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : items.length === 0 ? (
              <EmptyState
                icon={<FiSearch />}
                title={`No results for “${q}”`}
                description="Check your spelling or try a more general term."
                action={<Button as={Link} to={ROUTES.products}>Browse all products</Button>}
              />
            ) : (
              <>
                <motion.div
                  variants={staggerContainer(0.04)}
                  initial="initial"
                  animate="animate"
                  className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4"
                >
                  {items.map((p) => (
                    <ProductCard key={p._id} product={p} />
                  ))}
                </motion.div>
                {meta && (
                  <Pagination
                    className="mt-10"
                    page={meta.page}
                    totalPages={meta.totalPages}
                    onChange={(p) => setParam('page', String(p))}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
