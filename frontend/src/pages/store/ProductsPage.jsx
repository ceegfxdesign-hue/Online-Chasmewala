import { useMemo, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiSliders, FiChevronDown } from 'react-icons/fi';
import { useGetProductsQuery, useGetProductFacetsQuery } from '@/features/products/productApi';
import { ProductCard } from '@/components/product/ProductCard';
import { FilterSidebar } from '@/components/product/FilterSidebar';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Chip } from '@/components/ui/Chip';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { SORT_OPTIONS, PRICE_BOUNDS } from '@/constants/filters';
import { staggerContainer } from '@/lib/motion';
import { titleCase } from '@/lib/format';
import { absoluteUrl } from '@/lib/seo';
import { ROUTES } from '@/constants/routes';

const NON_FILTER_KEYS = new Set(['page', 'sort', 'q']);

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filters = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams]);
  const queryParams = useMemo(() => {
    const p = { ...filters };
    p.page = filters.page || 1;
    p.limit = 12;
    return p;
  }, [filters]);

  const { data, isFetching, isError } = useGetProductsQuery(queryParams);
  const { data: facets } = useGetProductFacetsQuery(filters);

  const update = useCallback(
    (mutator) => {
      const next = new URLSearchParams(searchParams);
      mutator(next);
      next.delete('page'); // any filter change resets pagination
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const onSet = useCallback(
    (key, value) => update((p) => (value ? p.set(key, value) : p.delete(key))),
    [update]
  );

  const onToggleMulti = useCallback(
    (key, value) =>
      update((p) => {
        const current = (p.get(key) || '').split(',').filter(Boolean);
        const idx = current.indexOf(value);
        if (idx >= 0) current.splice(idx, 1);
        else current.push(value);
        if (current.length) p.set(key, current.join(','));
        else p.delete(key);
      }),
    [update]
  );

  const onPrice = useCallback(
    ([min, max]) =>
      update((p) => {
        if (min > PRICE_BOUNDS.min) p.set('minPrice', String(min));
        else p.delete('minPrice');
        if (max < PRICE_BOUNDS.max) p.set('maxPrice', String(max));
        else p.delete('maxPrice');
      }),
    [update]
  );

  const onClear = useCallback(() => setSearchParams({}, { replace: true }), [setSearchParams]);

  const setPage = (page) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(page));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setSort = (e) => onSet('sort', e.target.value);

  // Active filter chips
  const activeChips = useMemo(() => {
    const chips = [];
    Object.entries(filters).forEach(([key, value]) => {
      if (NON_FILTER_KEYS.has(key) || !value) return;
      if (key === 'minPrice' || key === 'maxPrice') {
        return;
      }
      value.split(',').forEach((v) =>
        chips.push({ key, value: v, label: `${titleCase(v)}` })
      );
    });
    if (filters.minPrice || filters.maxPrice) {
      chips.push({ key: 'price', value: 'price', label: `₹${filters.minPrice || 0} – ₹${filters.maxPrice || PRICE_BOUNDS.max}` });
    }
    return chips;
  }, [filters]);

  const removeChip = (chip) => {
    if (chip.key === 'price') return onPrice([PRICE_BOUNDS.min, PRICE_BOUNDS.max]);
    if (['faceShape', 'blueLightFilter', 'polarized', 'uvProtection', 'inStock', 'onOffer'].includes(chip.key)) {
      return onSet(chip.key, '');
    }
    return onToggleMulti(chip.key, chip.value);
  };

  const activeCount = activeChips.length;
  const items = data?.items || [];
  const meta = data?.meta;
  const title = filters.category ? titleCase(filters.category) : 'All Eyewear';

  const sidebar = (
    <FilterSidebar
      filters={filters}
      facets={facets}
      onSet={onSet}
      onToggleMulti={onToggleMulti}
      onPrice={onPrice}
      onClear={onClear}
      onCloseMobile={() => setMobileFiltersOpen(false)}
      activeCount={activeCount}
    />
  );

  return (
    <>
      <Helmet>
        <title>{title} · Online Chasmewala</title>
        <meta name="description" content={`Shop ${title.toLowerCase()} at Online Chasmewala with easy filters, fast delivery and 14-day returns.`} />
        <link rel="canonical" href={absoluteUrl(ROUTES.products)} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${title} · Online Chasmewala`} />
        <meta property="og:description" content={`Shop ${title.toLowerCase()} at Online Chasmewala with easy filters, fast delivery and 14-day returns.`} />
        <meta property="og:url" content={absoluteUrl(ROUTES.products)} />
      </Helmet>

      <div className="container-page py-8">
        <Breadcrumb
          className="mb-4"
          items={[{ label: 'Home', to: ROUTES.home }, { label: title }]}
        />

        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-h2 text-navy-900">{title}</h1>
            {meta && <p className="mt-1 text-sm text-navy-400">{meta.total} products</p>}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-navy-200 px-4 py-2.5 text-sm font-medium text-navy-700 lg:hidden"
            >
              <FiSliders className="h-4 w-4" /> Filters
              {activeCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-xs text-white">
                  {activeCount}
                </span>
              )}
            </button>

            <div className="relative">
              <select
                value={filters.sort || 'relevance'}
                onChange={setSort}
                aria-label="Sort products"
                className="h-11 appearance-none rounded-xl border border-navy-200 bg-surface pl-4 pr-10 text-sm font-medium text-navy-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    Sort: {o.label}
                  </option>
                ))}
              </select>
              <FiChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
            </div>
          </div>
        </div>

        {activeChips.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            {activeChips.map((chip) => (
              <Chip key={`${chip.key}-${chip.value}`} selected onRemove={() => removeChip(chip)}>
                {chip.label}
              </Chip>
            ))}
            <button type="button" onClick={onClear} className="text-sm font-medium text-brand-600 hover:text-brand-700">
              Clear all
            </button>
          </div>
        )}

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden w-64 shrink-0 lg:block">{sidebar}</aside>

          {/* Results */}
          <div className="min-w-0 flex-1">
            {isError ? (
              <EmptyState title="Couldn’t load products" description="Please try again in a moment." />
            ) : isFetching ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : items.length === 0 ? (
              <EmptyState
                title="No products match your filters"
                description="Try removing a filter or widening your price range."
                action={<Button onClick={onClear}>Clear filters</Button>}
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
                    onChange={setPage}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Drawer open={mobileFiltersOpen} onClose={() => setMobileFiltersOpen(false)} side="left" title="Filters">
        <div className="px-5">{sidebar}</div>
      </Drawer>
    </>
  );
}
