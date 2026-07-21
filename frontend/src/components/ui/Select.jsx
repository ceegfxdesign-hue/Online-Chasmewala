import { forwardRef, useId } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { cn } from '@/utils/cn';

/**
 * Native select styled to match the design system. `options` is an array of
 * `{ label, value }` or plain strings.
 */
export const Select = forwardRef(function Select(
  { label, error, helper, options = [], placeholder, className, containerClassName, id, required, ...props },
  ref
) {
  const autoId = useId();
  const selectId = id || autoId;
  const describedBy = error ? `${selectId}-error` : helper ? `${selectId}-helper` : undefined;
  const normalized = options.map((o) => (typeof o === 'string' ? { label: o, value: o } : o));

  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-navy-700">
          {label}
          {required && <span className="ml-0.5 text-error">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'h-11 w-full appearance-none rounded-xl border bg-surface pl-4 pr-10 text-sm text-navy-900',
            'transition-colors duration-200 focus:outline-none focus:ring-2',
            'disabled:cursor-not-allowed disabled:bg-surface-subtle',
            error
              ? 'border-error focus:border-error focus:ring-error/40'
              : 'border-navy-200 focus:border-brand-500 focus:ring-brand-500/40',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {normalized.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <FiChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-navy-400"
        />
      </div>
      {error ? (
        <p id={`${selectId}-error`} className="mt-1.5 text-sm text-error">
          {error}
        </p>
      ) : helper ? (
        <p id={`${selectId}-helper`} className="mt-1.5 text-sm text-navy-400">
          {helper}
        </p>
      ) : null}
    </div>
  );
});

export default Select;
