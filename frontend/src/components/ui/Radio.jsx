import { forwardRef, useId } from 'react';
import { cn } from '@/utils/cn';

/** Accessible radio button with a custom indicator. */
export const Radio = forwardRef(function Radio({ label, description, className, id, ...props }, ref) {
  const autoId = useId();
  const rId = id || autoId;

  return (
    <label htmlFor={rId} className={cn('group flex cursor-pointer items-start gap-2.5', className)}>
      <span className="relative mt-0.5 inline-flex">
        <input ref={ref} id={rId} type="radio" className="peer sr-only" {...props} />
        <span
          aria-hidden="true"
          className={cn(
            'flex h-5 w-5 items-center justify-center rounded-full border border-navy-300 bg-surface transition-colors',
            'peer-checked:border-brand-500',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 peer-focus-visible:ring-offset-2'
          )}
        >
          <span className="h-2.5 w-2.5 scale-0 rounded-full bg-brand-500 transition-transform group-has-[:checked]:scale-100" />
        </span>
      </span>
      {(label || description) && (
        <span className="text-sm leading-tight">
          {label && <span className="font-medium text-navy-800">{label}</span>}
          {description && <span className="mt-0.5 block text-navy-400">{description}</span>}
        </span>
      )}
    </label>
  );
});

export default Radio;
