import { forwardRef, useId } from 'react';
import { FiCheck } from 'react-icons/fi';
import { cn } from '@/utils/cn';

/** Accessible checkbox with a custom check indicator. */
export const Checkbox = forwardRef(function Checkbox(
  { label, description, className, id, ...props },
  ref
) {
  const autoId = useId();
  const cbId = id || autoId;

  return (
    <label htmlFor={cbId} className={cn('group flex cursor-pointer items-start gap-2.5', className)}>
      <span className="relative mt-0.5 inline-flex">
        <input ref={ref} id={cbId} type="checkbox" className="peer sr-only" {...props} />
        <span
          aria-hidden="true"
          className={cn(
            'flex h-5 w-5 items-center justify-center rounded-md border border-navy-300 bg-surface transition-colors',
            'peer-checked:border-brand-500 peer-checked:bg-brand-500',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 peer-focus-visible:ring-offset-2'
          )}
        >
          <FiCheck className="h-3.5 w-3.5 scale-0 text-white transition-transform peer-checked:scale-100 group-has-[:checked]:scale-100" />
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

export default Checkbox;
