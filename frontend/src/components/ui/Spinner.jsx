import { cn } from '@/utils/cn';

/** Accessible loading spinner. */
export function Spinner({ className, size = 20, label = 'Loading' }) {
  return (
    <span role="status" aria-live="polite" className="inline-flex">
      <svg
        className={cn('animate-spin text-current', className)}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-90"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
}

export default Spinner;
