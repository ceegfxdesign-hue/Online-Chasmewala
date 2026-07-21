import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { cn } from '@/utils/cn';

/** Build a page list with ellipses, e.g. [1, '…', 4, 5, 6, '…', 20]. */
function pageRange(current, total, siblings = 1) {
  const totalNumbers = siblings * 2 + 5;
  if (total <= totalNumbers) return Array.from({ length: total }, (_, i) => i + 1);

  const left = Math.max(current - siblings, 1);
  const right = Math.min(current + siblings, total);
  const showLeftDots = left > 2;
  const showRightDots = right < total - 1;

  const pages = [1];
  if (showLeftDots) pages.push('left-dots');
  for (let i = left; i <= right; i += 1) if (i !== 1 && i !== total) pages.push(i);
  if (showRightDots) pages.push('right-dots');
  if (total > 1) pages.push(total);
  return pages;
}

/**
 * Page navigation control.
 */
export function Pagination({ page, totalPages, onChange, className }) {
  if (!totalPages || totalPages <= 1) return null;
  const pages = pageRange(page, totalPages);

  const btn =
    'inline-flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500';

  return (
    <nav aria-label="Pagination" className={cn('flex items-center justify-center gap-1.5', className)}>
      <button
        type="button"
        className={cn(btn, 'text-navy-600 hover:bg-navy-100 disabled:opacity-40')}
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <FiChevronLeft />
      </button>

      {pages.map((p, i) =>
        typeof p === 'string' ? (
          <span key={p + i} className="px-2 text-navy-300">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            aria-current={p === page ? 'page' : undefined}
            onClick={() => onChange(p)}
            className={cn(
              btn,
              p === page ? 'bg-brand-500 text-white' : 'text-navy-600 hover:bg-navy-100'
            )}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        className={cn(btn, 'text-navy-600 hover:bg-navy-100 disabled:opacity-40')}
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        <FiChevronRight />
      </button>
    </nav>
  );
}

export default Pagination;
