import { FiStar } from 'react-icons/fi';
import { cn } from '@/utils/cn';

/**
 * Star rating. Read-only by default; pass `onChange` to make it interactive
 * (e.g. in a review form).
 */
export function RatingStars({ value = 0, count, size = 16, onChange, className, showValue = false }) {
  const interactive = typeof onChange === 'function';
  const rounded = Math.round(value * 2) / 2;

  const star = (i) => {
    const filled = i <= Math.floor(rounded);
    const half = !filled && i - 0.5 === rounded;
    const node = (
      <span className="relative inline-block" style={{ width: size, height: size }}>
        <FiStar size={size} className="text-navy-200" />
        {(filled || half) && (
          <span
            className="absolute inset-0 overflow-hidden text-warning"
            style={{ width: half ? size / 2 : size }}
          >
            <FiStar size={size} className="fill-warning text-warning" />
          </span>
        )}
      </span>
    );
    if (!interactive) return <span key={i}>{node}</span>;
    return (
      <button
        key={i}
        type="button"
        onClick={() => onChange(i)}
        aria-label={`${i} star${i > 1 ? 's' : ''}`}
        className="rounded transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        {node}
      </button>
    );
  };

  return (
    <span
      className={cn('inline-flex items-center gap-0.5', className)}
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={interactive ? 'Rating' : `Rated ${value} out of 5`}
    >
      {[1, 2, 3, 4, 5].map(star)}
      {showValue && <span className="ml-1 text-sm font-medium text-navy-600">{value.toFixed(1)}</span>}
      {typeof count === 'number' && (
        <span className="ml-1 text-sm text-navy-400">({count})</span>
      )}
    </span>
  );
}

export default RatingStars;
