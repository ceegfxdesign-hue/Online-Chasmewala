import { lazy, Suspense, useMemo, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiSliders, FiChevronDown } from 'react-icons/fi';
import { useGetProductsQuery, useGetProductFacetsQuery } from '@/features/products/productApi';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { SORT_OPTIONS, PRICE_BOUNDS } from '@/constants/filters';
import { titleCase } from '@/lib/format';
import { absoluteUrl } from '@/lib/seo';
import { ROUTES } from '@/constants/routes';
import { useMediaQuery } from '@/hooks/useMediaQuery';

// Keep the filter controls and their animation library out of the initial
// mobile catalog download. They are loaded only when the customer needs them.
const FilterSidebar = lazy(() => import('@/components/product/FilterSidebar'));
const Drawer = lazy(() => import('@/components/ui/Drawer'));

const NON_FILTER_KEYS = new Set(['page', 'sort', 'q']);

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const filters = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams]);
  const queryParams = useMemo(() => {
    const p = { ...filters };
    p.page = filters.page || 1;
    p.limit = 12;
    return p;
  }, [filters]);

  const { data, isFetching, isError } = useGetProductsQuery(queryParams);
  const shouldLoadFilters = isDesktop || mobileFiltersOpen;
  const { data: facets } = useGetProductFacetsQuery(filters, { skip: !shouldLoadFilters });

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
  const isContactLensCatalog = filters.category === 'contact-lenses';
  const contactGroups = isContactLensCatalog ? [
    ['clear', 'Clear contacts'],
    ['color', 'Colour contacts'],
    ['care', 'Solutions & accessories'],
  ].map(([key, label]) => ({
    key,
    label,
    items: items.filter((product) => key === 'care'
      ? ['solution', 'accessory'].includes(product.contactLens?.kind)
      : product.contactLens?.kind === key),
  })).filter((group) => group.items.length) : [];

  const sidebar = shouldLoadFilters ? (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-surface-subtle" />}>
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
    </Suspense>
  ) : null;

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

          <div className="flex w-full items-center gap-2 sm:w-auto">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-navy-200 px-3 text-sm font-medium text-navy-700 sm:flex-none sm:px-4 lg:hidden"
            >
              <FiSliders className="h-4 w-4" /> Filters
              {activeCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-xs text-white">
                  {activeCount}
                </span>
              )}
            </button>

            <div className="relative min-w-0 flex-1 sm:flex-none">
              <select
                value={filters.sort || 'relevance'}
                onChange={setSort}
                aria-label="Sort products"
                className="h-11 w-full appearance-none rounded-xl border border-navy-200 bg-surface pl-4 pr-10 text-sm font-medium text-navy-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 sm:w-auto"
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
          {isDesktop && <aside className="w-64 shrink-0">{sidebar}</aside>}

          {/* Results */}
          <div className="min-w-0 flex-1">
            {isError ? (
              <EmptyState title="Couldn’t load products" description="Please try again in a moment." />
            ) : isFetching ? (
              <div className="grid grid-cols-1 gap-4 min-[375px]:grid-cols-2 sm:grid-cols-3 xl:grid-cols-4">
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
            ) : isContactLensCatalog && contactGroups.length ? (
              <div className="space-y-10">
                {contactGroups.map((group) => (
                  <section key={group.key}>
                    <div className="mb-4 flex items-center gap-3 border-b border-navy-100 pb-3"><h2 className="text-xl font-semibold text-navy-900">{group.label}</h2><span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-brand-700">{group.key === 'clear' ? 'Prescription ready' : group.key === 'color' ? 'Daily colour' : 'Care essentials'}</span></div>
                    <div className="grid grid-cols-1 gap-4 min-[375px]:grid-cols-2 sm:grid-cols-3 xl:grid-cols-4">{group.items.map((product, index) => <ProductCard key={product._id} product={product} priority={index === 0} />)}</div>
                  </section>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 min-[375px]:grid-cols-2 sm:grid-cols-3 xl:grid-cols-4">
                  {items.map((p, index) => (
                    <ProductCard key={p._id} product={p} priority={index === 0} />
                  ))}
                </div>

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

      {mobileFiltersOpen && (
        <Suspense fallback={null}>
          <Drawer open onClose={() => setMobileFiltersOpen(false)} side="left" title="Filters">
            <div className="px-5">{sidebar}</div>
          </Drawer>
        </Suspense>
      )}
    </>
  );
}
