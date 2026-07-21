import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import { cn } from '@/utils/cn';

/**
 * Consistent section heading with optional eyebrow, subtitle and "view all" link.
 */
export function SectionHeading({ eyebrow, title, subtitle, action, align = 'left', className }) {
  const centered = align === 'center';
  return (
    <div
      className={cn(
        'mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between',
        centered && 'sm:flex-col sm:items-center sm:text-center',
        className
      )}
    >
      <div className={cn(centered && 'mx-auto max-w-2xl')}>
        {eyebrow && (
          <span className="mb-1.5 inline-block text-sm font-semibold uppercase tracking-wider text-brand-700">
            {eyebrow}
          </span>
        )}
        <h2 className="text-h2 text-navy-900">{title}</h2>
        {subtitle && <p className="mt-2 max-w-xl text-navy-500">{subtitle}</p>}
      </div>
      {action &&
        (action.to ? (
          <Link
            to={action.to}
            className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            {action.label}
            <FiArrowRight className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : (
          action
        ))}
    </div>
  );
}

export default SectionHeading;
