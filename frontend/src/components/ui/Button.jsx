import { forwardRef } from 'react';
import { cn } from '@/utils/cn';
import { Spinner } from './Spinner';

const VARIANTS = {
  primary:
    'bg-brand-700 text-white shadow-soft hover:bg-brand-800 active:bg-brand-900 disabled:hover:bg-brand-700',
  secondary: 'bg-navy-900 text-white shadow-soft hover:bg-navy-800 active:bg-navy-700',
  outline:
    'border border-brand-500 text-brand-600 bg-transparent hover:bg-brand-50 active:bg-brand-100',
  ghost: 'text-navy-700 bg-transparent hover:bg-navy-100 active:bg-navy-200',
  subtle: 'bg-brand-50 text-brand-700 hover:bg-brand-100 active:bg-brand-200',
  danger: 'bg-error text-white shadow-soft hover:bg-error-dark active:bg-error-dark',
  link: 'text-brand-600 underline-offset-4 hover:underline p-0 h-auto shadow-none',
};

const SIZES = {
  sm: 'h-9 px-3.5 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
  icon: 'h-11 w-11 p-0 justify-center',
};

/**
 * Design-system button.
 *
 * @param {object} props
 * @param {'primary'|'secondary'|'outline'|'ghost'|'subtle'|'danger'|'link'} [props.variant]
 * @param {'sm'|'md'|'lg'|'icon'} [props.size]
 * @param {boolean} [props.loading]
 * @param {boolean} [props.fullWidth]
 * @param {React.ReactNode} [props.leftIcon]
 * @param {React.ReactNode} [props.rightIcon]
 * @param {React.ElementType} [props.as] Render as a different element (e.g. Link).
 */
export const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    className,
    children,
    disabled,
    as: Component = 'button',
    type,
    ...props
  },
  ref
) {
  const isButton = Component === 'button';
  return (
    <Component
      ref={ref}
      type={isButton ? type || 'button' : undefined}
      disabled={isButton ? disabled || loading : undefined}
      aria-busy={loading || undefined}
      aria-disabled={!isButton && (disabled || loading) ? true : undefined}
      className={cn(
        'inline-flex select-none items-center justify-center whitespace-nowrap rounded-xl font-semibold',
        'transition-all duration-200 ease-premium active:scale-[0.98]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-60',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading && <Spinner size={18} className="text-current" />}
      {!loading && leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
      {children}
      {!loading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </Component>
  );
});

export default Button;
