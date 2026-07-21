import { cn } from '@/utils/cn';

/**
 * Original Online Chasmewala brand mark: a minimalist spectacles glyph + wordmark.
 * `variant` controls contrast for light vs. dark backgrounds.
 */
export function Logo({ className, showText = true, variant = 'default' }) {
  const text = variant === 'light' ? 'text-white' : 'text-navy-900';
  const sub = variant === 'light' ? 'text-white/70' : 'text-brand-700';

  return (
    <span className={cn('inline-flex items-center gap-2.5 select-none', className)}>
      <svg
        width="34"
        height="34"
        viewBox="0 0 64 64"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#00d4d4" />
            <stop offset="1" stopColor="#00a6a6" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="14" fill={variant === 'light' ? '#ffffff' : '#0f172a'} />
        <circle cx="21" cy="34" r="11" fill="none" stroke="url(#logoGrad)" strokeWidth="4" />
        <circle cx="43" cy="34" r="11" fill="none" stroke="url(#logoGrad)" strokeWidth="4" />
        <path d="M30 33 q2 -4 4 0" fill="none" stroke="url(#logoGrad)" strokeWidth="4" strokeLinecap="round" />
        <path d="M10 30 l3 -4" fill="none" stroke="url(#logoGrad)" strokeWidth="4" strokeLinecap="round" />
        <path d="M54 30 l-3 -4" fill="none" stroke="url(#logoGrad)" strokeWidth="4" strokeLinecap="round" />
      </svg>
      {showText && (
        <span className="leading-none">
          <span className={cn('block font-display text-lg font-extrabold tracking-tight', text)}>
            Online Chasmewala
          </span>
          <span className={cn('block text-[10px] font-semibold uppercase tracking-[0.18em]', sub)}>
            Premium Eyewear
          </span>
        </span>
      )}
    </span>
  );
}

export default Logo;
