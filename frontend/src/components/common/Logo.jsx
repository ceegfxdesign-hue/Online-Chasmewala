import { cn } from '@/utils/cn';

/** Shared brand logo used by the storefront, account and admin layouts. */
export function Logo({ className, compactOnMobile = false }) {
  return (
    <img
      src="/brand-logo.jpeg"
      width="96"
      height="96"
      alt="Online Chasmewala"
      className={cn(
        'shrink-0 rounded-full object-cover',
        compactOnMobile ? 'h-10 w-10 sm:h-11 sm:w-11' : 'h-16 w-16 sm:h-20 sm:w-20',
        className
      )}
    />
  );
}

export default Logo;
