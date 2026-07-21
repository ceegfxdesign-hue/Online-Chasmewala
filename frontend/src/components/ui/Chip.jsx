import { FiX } from 'react-icons/fi';
import { cn } from '@/utils/cn';

/**
 * Interactive chip — used for active filters, tags and selectable options.
 * `selected` toggles the active style; `onRemove` renders a dismiss button.
 */
export function Chip({ children, selected = false, onRemove, className, ...props }) {
  const clickable = Boolean(props.onClick);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
        selected
          ? 'border-brand-500 bg-brand-50 text-brand-700'
          : 'border-navy-200 bg-surface text-navy-600 hover:border-navy-300',
        clickable && 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
        className
      )}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      {...props}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label="Remove"
          className="-mr-1 rounded-full p-0.5 text-navy-400 hover:bg-navy-100 hover:text-navy-700"
        >
          <FiX className="h-3.5 w-3.5" />
        </button>
      )}
    </span>
  );
}

export default Chip;
