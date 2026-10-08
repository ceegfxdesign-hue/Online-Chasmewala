import { cn } from '@/utils/cn';
import brandLogo from '@/assets/brand-logo.png';
import brandLogoLight from '@/assets/brand-logo-light.png';

/** Shared brand logo used by the storefront, account and admin layouts. */
export function Logo({ className, compactOnMobile = false, variant = 'default' }) {
  const isLight = variant === 'light';
  const logoSrc = isLight ? brandLogoLight : brandLogo;

  return (
    <img
      src={logoSrc}
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

