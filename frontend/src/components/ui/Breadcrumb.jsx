import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';
import { cn } from '@/utils/cn';

/**
 * Breadcrumb trail. `items` = `{ label, to? }[]`; the last item is the current
 * page and is not linked.
 */
export function Breadcrumb({ items = [], className }) {
  return (
    <nav aria-label="Breadcrumb" className={cn('text-sm', className)}>
      <ol className="flex flex-wrap items-center gap-1.5 text-navy-400">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
              {item.to && !last ? (
                <Link to={item.to} className="transition-colors hover:text-brand-600">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? 'page' : undefined} className={last ? 'font-medium text-navy-700' : ''}>
                  {item.label}
                </span>
              )}
              {!last && <FiChevronRight className="h-4 w-4 text-navy-300" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
