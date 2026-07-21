import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiSearch, FiClock, FiTrendingUp, FiX } from 'react-icons/fi';
import { useLazyGetSuggestionsQuery } from '@/features/products/productApi';
import { useDebounce } from '@/hooks/useDebounce';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import { loadState, saveState } from '@/lib/storage';
import { formatPrice } from '@/lib/format';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';

const TRENDING = ['Aviator', 'Blue light', 'Cat-eye', 'Round', 'Polarized', 'Titanium'];

/** Instant search with suggestions, recent and trending searches. */
export function SearchBar({ className, onNavigate }) {
  const navigate = useNavigate();
  const [term, setTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState(() => loadState('recentSearches', []));
  const containerRef = useRef(null);
  const debounced = useDebounce(term, 250);

  const [trigger, { data, isFetching }] = useLazyGetSuggestionsQuery();

  useOnClickOutside(containerRef, () => setOpen(false));

  useEffect(() => {
    if (debounced.trim().length >= 2) trigger(debounced.trim());
  }, [debounced, trigger]);

  const commit = (q) => {
    const query = q.trim();
    if (!query) return;
    const next = [query, ...recent.filter((r) => r.toLowerCase() !== query.toLowerCase())].slice(0, 6);
    setRecent(next);
    saveState('recentSearches', next);
    setOpen(false);
    setTerm('');
    onNavigate?.();
    navigate(`${ROUTES.search}?q=${encodeURIComponent(query)}`);
  };

  const clearRecent = () => {
    setRecent([]);
    saveState('recentSearches', []);
  };

  const hasSuggestions =
    data && (data.products?.length || data.brands?.length || data.categories?.length);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          commit(term);
        }}
      >
        <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
        <input
          type="search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Search frames, brands…"
          aria-label="Search products"
          className="h-10 w-full rounded-xl border border-navy-200 bg-surface-muted pl-10 pr-4 text-sm placeholder:text-navy-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
        />
      </form>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-navy-100 bg-surface p-2 shadow-elevated">
          {term.trim().length >= 2 ? (
            <>
              {isFetching && <p className="px-3 py-2 text-sm text-navy-400">Searching…</p>}
              {!isFetching && !hasSuggestions && (
                <p className="px-3 py-2 text-sm text-navy-400">No matches. Press Enter to search.</p>
              )}
              {data?.products?.length > 0 && (
                <div className="mb-1">
                  <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-navy-300">Products</p>
                  {data.products.map((p) => (
                    <Link
                      key={p._id}
                      to={ROUTES.product(p.slug)}
                      onClick={() => { setOpen(false); onNavigate?.(); }}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-navy-100"
                    >
                      <img src={p.images?.[0]} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      <span className="flex-1 truncate text-sm text-navy-800">{p.name}</span>
                      <span className="text-sm font-semibold text-navy-900">{formatPrice(p.price)}</span>
                    </Link>
                  ))}
                </div>
              )}
              {(data?.brands?.length > 0 || data?.categories?.length > 0) && (
                <div className="flex flex-wrap gap-1.5 border-t border-navy-100 p-2">
                  {data.categories?.map((c) => (
                    <Link
                      key={c._id}
                      to={`${ROUTES.products}?category=${c.slug}`}
                      onClick={() => { setOpen(false); onNavigate?.(); }}
                      className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 hover:bg-brand-100"
                    >
                      {c.name}
                    </Link>
                  ))}
                  {data.brands?.map((b) => (
                    <Link
                      key={b._id}
                      to={`${ROUTES.products}?brand=${b.slug}`}
                      onClick={() => { setOpen(false); onNavigate?.(); }}
                      className="rounded-full bg-navy-100 px-3 py-1 text-xs font-medium text-navy-700 hover:bg-navy-200"
                    >
                      {b.name}
                    </Link>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {recent.length > 0 && (
                <div className="mb-1">
                  <div className="flex items-center justify-between px-3 py-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-navy-300">Recent</p>
                    <button type="button" onClick={clearRecent} className="text-xs text-navy-400 hover:text-error">
                      Clear
                    </button>
                  </div>
                  {recent.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => commit(r)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-navy-700 hover:bg-navy-100"
                    >
                      <FiClock className="h-4 w-4 text-navy-300" /> {r}
                    </button>
                  ))}
                </div>
              )}
              <div className="p-2">
                <p className="mb-2 flex items-center gap-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-navy-300">
                  <FiTrendingUp className="h-3.5 w-3.5" /> Trending
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {TRENDING.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => commit(t)}
                      className="rounded-full border border-navy-200 px-3 py-1 text-xs font-medium text-navy-600 hover:border-brand-400 hover:text-brand-600"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
      {term && (
        <button
          type="button"
          onClick={() => setTerm('')}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 hidden -translate-y-1/2 text-navy-400 hover:text-navy-700 md:block"
        >
          <FiX className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export default SearchBar;
