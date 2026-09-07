/** Lenskart-style package card with optical artwork and transparent combined pricing. */
import { FiChevronRight, FiPlay, FiShield } from 'react-icons/fi';
import { formatPrice } from '@/lib/format';
import { cn } from '@/utils/cn';

const ribbonColors = { blue: 'bg-[#0060D5]', red: 'bg-[#D12E2E]', green: 'bg-[#0A8367]' };
export function PowerLensIllustration({ kind }) {
  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10" aria-hidden="true" fill="none">
      <path
        d="M7 13Q24 7 41 13L38 33Q24 42 10 33Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill={kind === 'Square' ? 'none' : '#E8F4FC'}
      />
      {kind === 'Eye' && (
        <path d="M14 23H24M19 18V28M28 23H35" stroke="currentColor" strokeWidth="2" />
      )}
      {kind === 'Monitor' && <path d="M12 13L36 34M19 11L39 28" stroke="#78C7E8" strokeWidth="3" />}
      {kind === 'Layers' && <path d="M12 31Q24 21 37 31" stroke="#6FA6D3" strokeWidth="2" />}
      {kind === 'Square' && <path d="M2 13H8M40 13H46" stroke="currentColor" strokeWidth="1.5" />}
    </svg>
  );
}
export function LensIllustration({ className }) {
  return (
    <svg viewBox="0 0 180 145" className={className} aria-hidden="true" fill="none">
      <path
        d="M26 27 Q86 7 151 28 Q173 66 140 125 Q90 144 43 118 Q12 72 26 27Z"
        fill="#EDF4F8"
        stroke="#AABDC9"
        strokeWidth="2"
      />
      <path d="M32 32 Q91 15 148 33 L137 117 Q84 136 48 112Z" fill="white" fillOpacity=".65" />
      <path
        d="M23 40L142 119M31 25L155 106M24 100L139 22"
        stroke="#80BCDA"
        strokeWidth="2"
        opacity=".55"
      />
      <path d="M40 20L148 97M30 115L146 33" stroke="white" strokeWidth="5" opacity=".9" />
    </svg>
  );
}
export function LensPackageCard({
  pack,
  framePrice,
  frameMrp,
  powerPrice,
  selected,
  onSelect,
  onDetails,
  onPlay,
}) {
  const total = Number(framePrice) + Number(powerPrice) + Number(pack.price || 0);
  const original =
    Number(frameMrp || framePrice) + Number(powerPrice) + Number(pack.mrp || pack.price || 0);
  return (
    <article
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-surface shadow-sm transition-all hover:border-brand-400 hover:shadow-md',
        selected ? 'border-brand-500' : 'border-navy-100'
      )}
    >
      <button
        type="button"
        aria-label={'Select ' + pack.name}
        aria-pressed={selected}
        onClick={onSelect}
        className="absolute inset-0 z-[1] w-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500"
      >
        <span className="sr-only">{pack.name}</span>
      </button>
      {pack.ribbonText && pack.ribbonColor !== 'none' && (
        <span
          className={cn(
            'pointer-events-none absolute left-0 top-3 z-10 rounded-br-lg px-3 py-0.5 text-[11px] font-bold text-white',
            ribbonColors[pack.ribbonColor] || ribbonColors.blue
          )}
        >
          {pack.ribbonText}
        </span>
      )}
      <div className="pointer-events-none relative grid sm:grid-cols-[32%_1fr]">
        <div className="flex flex-col items-center justify-center bg-navy-50/30 px-4 pb-4 pt-8">
          <button
            type="button"
            className="pointer-events-auto relative z-10 w-36 max-w-full rounded-xl focus-visible:ring-2 focus-visible:ring-brand-500"
            onClick={onPlay}
            aria-label={'Preview ' + pack.name}
          >
            {pack.imageUrl ? (
              <img src={pack.imageUrl} alt="" className="aspect-[180/145] w-full object-contain" />
            ) : (
              <LensIllustration className="w-full" />
            )}
            <span className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-navy-900/70 text-white">
              <FiPlay className="ml-0.5 fill-current" />
            </span>
          </button>
          {pack.warranty && (
            <p className="mt-2 flex items-center gap-1 text-center text-xs font-medium text-navy-600">
              <FiShield />
              {pack.warranty}
            </p>
          )}
        </div>
        <div className="min-w-0 p-4">
          <div className="flex w-full items-start justify-between gap-3 text-left">
            <span className="font-semibold text-navy-900">{pack.name}</span>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#000042] text-white">
              <FiChevronRight />
            </span>
          </div>
          <ul className="mt-3 space-y-1.5 text-sm text-navy-500">
            {pack.features?.map((feature, i) => (
              <li key={i} className="flex gap-2">
                <span aria-hidden="true">{pack.featureIcons?.[i] || '⚡'}</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={onDetails}
            className="pointer-events-auto relative z-10 mt-2 text-xs font-semibold text-brand-600 hover:underline"
          >
            View Details &gt;
          </button>
          <div className="mt-3 flex items-end justify-between gap-3 border-t border-dashed border-navy-100 pt-3">
            <span className="text-xs font-semibold text-navy-600">{pack.couponText}</span>
            <span className="text-right">
              <span className="block text-[10px] text-navy-400">Frame + Lens</span>
              <span className="text-sm font-semibold text-blue-600">{formatPrice(total)}</span>
              {original > total && (
                <del className="ml-1 text-xs text-navy-400">{formatPrice(original)}</del>
              )}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
