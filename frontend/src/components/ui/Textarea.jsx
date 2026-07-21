import { forwardRef, useId } from 'react';
import { cn } from '@/utils/cn';

/** Multiline text input matching the design system. */
export const Textarea = forwardRef(function Textarea(
  { label, error, helper, className, containerClassName, id, required, rows = 4, ...props },
  ref
) {
  const autoId = useId();
  const taId = id || autoId;
  const describedBy = error ? `${taId}-error` : helper ? `${taId}-helper` : undefined;

  return (
    <div className={cn('w-full', containerClassName)}>
      {label && (
        <label htmlFor={taId} className="mb-1.5 block text-sm font-medium text-navy-700">
          {label}
          {required && <span className="ml-0.5 text-error">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={taId}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          'w-full resize-y rounded-xl border bg-surface px-4 py-2.5 text-sm text-navy-900 placeholder:text-navy-300',
          'transition-colors duration-200 focus:outline-none focus:ring-2',
          error
            ? 'border-error focus:border-error focus:ring-error/40'
            : 'border-navy-200 focus:border-brand-500 focus:ring-brand-500/40',
          className
        )}
        {...props}
      />
      {error ? (
        <p id={`${taId}-error`} className="mt-1.5 text-sm text-error">
          {error}
        </p>
      ) : helper ? (
        <p id={`${taId}-helper`} className="mt-1.5 text-sm text-navy-400">
          {helper}
        </p>
      ) : null}
    </div>
  );
});

export default Textarea;
