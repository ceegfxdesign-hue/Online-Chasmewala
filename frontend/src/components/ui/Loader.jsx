import { Spinner } from './Spinner';
import { cn } from '@/utils/cn';

/** Full-area loading state used by Suspense fallbacks and lazy sections. */
export function Loader({ label = 'Loading…', className, fullscreen = false }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 text-navy-400',
        fullscreen ? 'min-h-[60vh]' : 'py-16',
        className
      )}
    >
      <Spinner size={32} className="text-brand-500" label={label} />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export default Loader;
