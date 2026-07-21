import { cn } from '@/utils/cn';

/**
 * Loading placeholder using the shimmer defined in globals.css.
 * `variant` picks a common shape.
 */
export function Skeleton({ variant = 'block', className, ...props }) {
  const variants = {
    block: 'h-4 w-full rounded-lg',
    text: 'h-3.5 w-3/4 rounded',
    title: 'h-6 w-1/2 rounded-lg',
    avatar: 'h-10 w-10 rounded-full',
    thumb: 'aspect-square w-full rounded-2xl',
    button: 'h-11 w-28 rounded-xl',
  };
  return <div className={cn('skeleton', variants[variant], className)} aria-hidden="true" {...props} />;
}

/** Product card skeleton, matching ProductCard layout. */
export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl bg-surface p-4 shadow-card">
      <Skeleton variant="thumb" className="mb-4" />
      <Skeleton variant="text" className="mb-2 w-1/3" />
      <Skeleton variant="text" className="mb-3 w-4/5" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
}

export default Skeleton;
