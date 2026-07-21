import { useCallback } from 'react';
import { formatPrice } from '@/lib/format';
import { cn } from '@/utils/cn';

/**
 * Dual-thumb price range slider built on two range inputs. Controlled via
 * `value = [min, max]` and `onChange`.
 */
export function PriceSlider({ min = 0, max = 10000, step = 100, value, onChange, className }) {
  const [low, high] = value;
  const pct = (v) => ((v - min) / (max - min)) * 100;

  const handleLow = useCallback(
    (e) => {
      const next = Math.min(Number(e.target.value), high - step);
      onChange([next, high]);
    },
    [high, step, onChange]
  );

  const handleHigh = useCallback(
    (e) => {
      const next = Math.max(Number(e.target.value), low + step);
      onChange([low, next]);
    },
    [low, step, onChange]
  );

  return (
    <div className={cn('w-full', className)}>
      <div className="relative h-6">
        <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-navy-100" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-brand-500"
          style={{ left: `${pct(low)}%`, right: `${100 - pct(high)}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={low}
          onChange={handleLow}
          aria-label="Minimum price"
          className="pointer-events-none absolute inset-0 h-6 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-brand-500 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={high}
          onChange={handleHigh}
          aria-label="Maximum price"
          className="pointer-events-none absolute inset-0 h-6 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-brand-500 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow"
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-sm font-medium text-navy-600">
        <span>{formatPrice(low)}</span>
        <span>{formatPrice(high)}</span>
      </div>
    </div>
  );
}

export default PriceSlider;
