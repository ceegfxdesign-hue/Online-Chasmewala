import { prescriptionEntries } from '@/lib/lensSelection';
import { formatPrice } from '@/lib/format';
import { cn } from '@/utils/cn';

export function LensConfigurationSummary({ lensOption, prescription, compact = false, showPrice = false, className }) {
  if (!lensOption) return null;

  const values = prescriptionEntries(prescription);
  const powerLabel = lensOption.powerTypeLabel || lensOption.baseType;
  const title = lensOption.packageName
    ? [powerLabel, lensOption.packageName].filter((value, index, list) => value && list.indexOf(value) === index).join(' · ')
    : lensOption.label || powerLabel || lensOption.type;

  return (
    <div className={cn(compact ? 'text-xs' : 'rounded-xl border border-brand-100 bg-brand-50/40 p-3 text-sm', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold text-brand-800">
          {title}
        </p>
        {showPrice && Number(lensOption.price) > 0 && (
          <span className="font-semibold text-navy-800">
            +{formatPrice(lensOption.price)}
            {Number(lensOption.mrp) > Number(lensOption.price) && <span className="ml-1 text-xs font-normal text-navy-400 line-through">{formatPrice(lensOption.mrp)}</span>}
          </span>
        )}
      </div>
      {lensOption.colour && <p className="mt-1 text-xs text-navy-600">Colour: <span className="font-semibold text-navy-800">{lensOption.colour}</span></p>}
      {!compact && (lensOption.badge || lensOption.warrantyMonths) && (
        <p className="mt-1 text-xs text-navy-500">
          {[lensOption.badge, lensOption.warrantyMonths ? `${lensOption.warrantyMonths}-month warranty` : ''].filter(Boolean).join(' · ')}
        </p>
      )}
      {!compact && lensOption.subtitle && <p className="mt-1 text-xs text-navy-600">{lensOption.subtitle}</p>}
      {!compact && lensOption.features?.length > 0 && (
        <p className="mt-1 text-xs text-navy-500">{lensOption.features.join(' · ')}</p>
      )}
      {values.length > 0 && (
        <dl className={cn('mt-2 grid gap-x-4 gap-y-1', compact ? 'grid-cols-1 text-navy-500' : 'sm:grid-cols-2')}>
          {values.map(({ label, value }) => (
            <div key={label} className="flex justify-between gap-3">
              <dt className="text-navy-500">{label}</dt>
              <dd className="font-semibold text-navy-800">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

export default LensConfigurationSummary;
