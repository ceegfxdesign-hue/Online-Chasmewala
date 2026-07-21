import { cn } from '@/utils/cn';

const VARIANTS = {
  brand: 'bg-brand-50 text-brand-700',
  navy: 'bg-navy-900 text-white',
  success: 'bg-success-light text-success-dark',
  error: 'bg-error-light text-error-dark',
  warning: 'bg-warning-light text-warning-dark',
  neutral: 'bg-navy-100 text-navy-600',
  accent: 'bg-accent-500 text-navy-900',
};

const SIZES = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-1 text-xs',
};

/** Small status/label pill. */
export function Badge({ variant = 'brand', size = 'md', className, children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold uppercase tracking-wide',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
