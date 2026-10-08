import { cn } from '@/utils/cn';
import brandLogo from '@/assets/brand-logo.jpeg';

/** Shared brand logo used by the storefront, account and admin layouts. */
export function Logo({ className, compactOnMobile = false, variant = 'default' }) {
  if (variant === 'light') {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-2xl bg-white px-3 py-1.5 shadow-xs ring-1 ring-black/5',
          className
        )}
      >
        <img
          src={brandLogo}
          width="180"
          height="120"
          alt="Online Chasmewala"
          className={cn(
            'shrink-0 object-contain',
            compactOnMobile ? 'h-8 w-auto sm:h-9 sm:w-auto' : 'h-10 w-auto sm:h-12 sm:w-auto'
          )}
        />
      </span>
    );
  }

  return (
    <img
      src={brandLogo}
      width="180"
      height="120"
      alt="Online Chasmewala"
      className={cn(
        'shrink-0 object-contain',
        compactOnMobile ? 'h-9 w-auto sm:h-11 sm:w-auto' : 'h-11 w-auto sm:h-14 sm:w-auto',
        className
      )}
    />
  );
}

export default Logo;

