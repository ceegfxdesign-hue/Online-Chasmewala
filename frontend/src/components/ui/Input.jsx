import { forwardRef, useId } from 'react';
import { cn } from '@/utils/cn';

/**
 * Text input with label, icons, helper/error text and full a11y wiring.
 */
export const Input = forwardRef(function Input(
  {
    label,
    error,
    helper,
    leftIcon,
    rightIcon,
    className,
    containerClassName,
    id,
    required,
    type = 'text',
    ...props
  },
  ref
) {
  const autoId = useId();
  const inputId = id || autoId;
  const describedBy = error ? `${inputId}-error` : helper ? `${inputId}-helper` : undefined;

  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-navy-700">
          {label}
          {required && <span className="ml-0.5 text-error">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'h-11 w-full rounded-xl border bg-surface text-navy-900 placeholder:text-navy-300',
            'px-4 text-sm transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:text-navy-400',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error
              ? 'border-error focus:border-error focus:ring-error/40'
              : 'border-navy-200 focus:border-brand-500 focus:ring-brand-500/40',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-400">
            {rightIcon}
          </span>
        )}
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="mt-1.5 text-sm text-error">
          {error}
        </p>
      ) : helper ? (
        <p id={`${inputId}-helper`} className="mt-1.5 text-sm text-navy-400">
          {helper}
        </p>
      ) : null}
    </div>
  );
});

export default Input;
