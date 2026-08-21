import { useEffect, useMemo, useState } from 'react';
import { FiChevronRight } from 'react-icons/fi';
import { Modal } from '@/components/ui';
import { cn } from '@/utils/cn';

const DEFAULT_NEGATIVE_LIMIT = -3;
const DEFAULT_POSITIVE_LIMIT = 3;
const DEFAULT_POWER_STEP = 0.25;
const MAX_POWER_CHOICES = 1000;
const EYES = [
  { key: 'right', label: 'Right', value: 'Right eye' },
  { key: 'left', label: 'Left', value: 'Left eye' },
];

function decimalPlaces(value) {
  const text = String(value);
  return text.includes('.') ? text.split('.')[1].length : 0;
}

export function getPowerColumns(powerType = {}) {
  const min = Math.max(-200, Math.min(200, Number(powerType.min ?? DEFAULT_NEGATIVE_LIMIT)));
  const max = Math.max(min, Math.min(200, Number(powerType.max ?? DEFAULT_POSITIVE_LIMIT)));
  const step = Math.max(0.01, Math.min(200, Number(powerType.step ?? DEFAULT_POWER_STEP)));
  const precision = Math.min(4, Math.max(decimalPlaces(min), decimalPlaces(max), decimalPlaces(step)));
  const count = Math.min(MAX_POWER_CHOICES, Math.floor((max - min) / step) + 1);
  const negative = [];
  const positive = [];

  for (let index = 0; index < count; index += 1) {
    const value = Number((min + (index * step)).toFixed(precision));
    const label = `${value > 0 ? '+' : ''}${value.toFixed(precision)}`;
    (value < 0 ? negative : positive).push(label);
  }

  return { negative, positive };
}

export function ContactLensConfigurator({ product, onChange, onGalleryImages }) {
  const config = product.contactLens || {};
  const packs = config.packOptions?.length ? config.packOptions : [];
  const contactKind = config.kind || 'clear';
  const supportsEyePower = contactKind === 'clear' || contactKind === 'color';
  const configuredPowerModes = config.powerModes?.length ? config.powerModes : ['with-power'];
  const powerModes = supportsEyePower ? configuredPowerModes : ['zero-power'];
  const [powerMode, setPowerMode] = useState(powerModes[0]);
  const [packIndex, setPackIndex] = useState(0);
  const [colourIndex, setColourIndex] = useState(0);
  const [values, setValues] = useState({});
  const [selectedEyes, setSelectedEyes] = useState({ right: true, left: true });
  const [picker, setPicker] = useState(null);
  const selectionLabel = supportsEyePower
    ? (powerMode === 'with-power' ? 'With Power' : 'Zero Power')
    : (contactKind === 'solution' ? 'Solution' : 'Accessory');
  const powerTypes = useMemo(() => {
    if (config.powerTypes?.length) return config.powerTypes;
    const legacyFields = config.prescriptionFields?.length ? config.prescriptionFields : ['Spherical'];
    return legacyFields.map((name) => ({
      name,
      min: config.sphericalPowerMin ?? DEFAULT_NEGATIVE_LIMIT,
      max: config.sphericalPowerMax ?? DEFAULT_POSITIVE_LIMIT,
      step: DEFAULT_POWER_STEP,
    }));
  }, [config.powerTypes, config.prescriptionFields, config.sphericalPowerMax, config.sphericalPowerMin]);
  const colours = useMemo(() => config.availableColors || [], [config.availableColors]);
  const selectedPack = packs[packIndex] || packs[0];
  const requiresPower = powerMode === 'with-power';
  const powerColumns = useMemo(() => getPowerColumns(picker?.powerType), [picker?.powerType]);
  const emittedValues = useMemo(() => Object.fromEntries(
    Object.entries(values).filter(([key]) => EYES.some(
      (eye) => selectedEyes[eye.key] && key.endsWith(`:${eye.value}`)
    ))
  ), [selectedEyes, values]);
  const isComplete = useMemo(() => {
    if (!requiresPower) return true;
    const activeEyes = EYES.filter((eye) => selectedEyes[eye.key]);
    return activeEyes.length > 0 && activeEyes.every((eye) => powerTypes.every((powerType) => {
      const value = emittedValues[`${powerType.name}:${eye.value}`];
      return value !== undefined && value !== '';
    }));
  }, [emittedValues, powerTypes, requiresPower, selectedEyes]);

  useEffect(() => {
    setPowerMode(powerModes[0]);
    setPackIndex(0);
    setColourIndex(0);
    setValues({});
    setSelectedEyes({ right: true, left: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product._id]);

  useEffect(() => {
    onChange({
      type: `contact-${contactKind}-${powerMode}-${packIndex}-${colourIndex}`,
      label: [selectionLabel, selectedPack?.label]
        .filter(Boolean)
        .join(' · '),
      price: selectedPack ? Math.max(0, Number(selectedPack.price ?? product.price) - Number(product.price)) : 0,
      packageId: selectedPack ? `contact-${packIndex}` : undefined,
      prescription: powerMode === 'with-power' ? { method: 'manual', values: emittedValues } : undefined,
      colour: colours[colourIndex]?.name,
      isComplete,
    });
  }, [colourIndex, colours, contactKind, emittedValues, isComplete, onChange, packIndex, powerMode, product.price, selectedPack, selectionLabel]);

  useEffect(() => {
    const images = colours[colourIndex]?.images;
    onGalleryImages(images?.length ? images : null);
  }, [colourIndex, colours, onGalleryImages]);

  const setValue = (eye, value) => {
    const field = picker?.powerType?.name || 'Power';
    setValues((current) => ({ ...current, [`${field}:${eye}`]: value }));
  };

  return (
    <div className="mt-6 space-y-5 border-t border-navy-100 pt-5">
      {supportsEyePower && (
        <div>
          <p className="mb-2 text-sm font-semibold text-navy-900">Power type</p>
          <div className="flex flex-wrap gap-2">
            {powerModes.map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setPowerMode(mode)}
                aria-pressed={powerMode === mode}
                className={cn(
                  'rounded-full border px-4 py-2 text-sm font-semibold',
                  powerMode === mode
                    ? 'border-navy-900 bg-navy-900 text-white'
                    : 'border-navy-200 bg-surface text-navy-700'
                )}
              >
                {mode === 'with-power' ? 'With Power' : 'Zero Power'}
              </button>
            ))}
          </div>
        </div>
      )}

      {requiresPower && (
        <div className="rounded-2xl bg-navy-50 p-3 sm:p-4">
          <div className="overflow-hidden rounded-xl border border-navy-100 bg-surface">
            <p className="border-b border-navy-100 px-3 py-3 text-sm font-semibold text-navy-900">Enter power manually</p>
            <div className="space-y-3 px-3 py-4">
              <div className="grid grid-cols-[minmax(0,1fr)_repeat(2,minmax(0,1fr))] gap-2">
                <span />
                {EYES.map((eye) => (
                  <label key={eye.key} className="flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-navy-700">
                    <input
                      type="checkbox"
                      checked={selectedEyes[eye.key]}
                      onChange={(event) => setSelectedEyes((current) => ({ ...current, [eye.key]: event.target.checked }))}
                      className="accent-navy-900"
                    />
                    {eye.label}
                  </label>
                ))}
              </div>
              {powerTypes.map((powerType) => (
                <div key={powerType.name} className="grid grid-cols-[minmax(0,1fr)_repeat(2,minmax(0,1fr))] items-center gap-2">
                  <p className="text-sm font-semibold text-navy-800">{powerType.name}</p>
                  {EYES.map((eye) => (
                    <button
                      key={eye.key}
                      type="button"
                      aria-label={`${powerType.name} · ${eye.value}`}
                      disabled={!selectedEyes[eye.key]}
                      onClick={() => setPicker({ powerType, eye: eye.value })}
                      className="flex min-w-0 items-center justify-between rounded-lg border border-navy-200 px-3 py-2.5 text-left text-sm text-navy-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <span className="truncate">{values[`${powerType.name}:${eye.value}`] || 'Select'}</span>
                      <FiChevronRight className="shrink-0" />
                    </button>
                  ))}
                </div>
              ))}
              <p className={cn('text-xs font-medium', isComplete ? 'text-success-dark' : 'text-navy-500')} role="status">
                {isComplete ? 'Power details complete.' : 'Select every power value for at least one eye.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {config.kind === 'color' && colours.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-navy-900">Available colors</p>
          <div className="flex flex-wrap gap-2">
            {colours.map((color, index) => (
              <button key={`${color.name}-${index}`} type="button" onClick={() => setColourIndex(index)} aria-pressed={colourIndex === index} className={cn('rounded-xl border px-3 py-2 text-left text-xs font-semibold', colourIndex === index ? 'border-navy-900 bg-navy-50 text-navy-900' : 'border-navy-100 text-navy-600')}>
                <span className="mb-1 block h-5 w-5 rounded-full border border-white shadow-soft" style={{ backgroundColor: color.hex || '#9CA3AF' }} />
                {color.name}
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm text-navy-600" aria-live="polite">Selected colour: <span className="font-semibold text-navy-900">{colours[colourIndex]?.name}</span></p>
        </div>
      )}

      {packs.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-navy-900">{config.kind === 'solution' ? 'Quantity' : config.kind === 'accessory' ? 'Select option' : 'Lenses per pack'}</p>
          <div className="flex flex-wrap gap-2">
            {packs.map((pack, index) => (
              <button key={`${pack.label}-${index}`} type="button" onClick={() => setPackIndex(index)} aria-pressed={packIndex === index} className={cn('min-w-28 rounded-xl border p-3 text-left text-sm', packIndex === index ? 'border-navy-900 bg-navy-50 text-navy-900' : 'border-navy-100 bg-surface text-navy-600')}>
                <span className="block font-semibold">{pack.label}</span>
                <span className="mt-1 block text-xs">₹{Number(pack.price ?? product.price).toLocaleString('en-IN')}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <Modal open={Boolean(picker)} onClose={() => setPicker(null)} title={`${picker?.powerType?.name || 'Power'} · ${picker?.eye || ''}`} size="sm">
        <div className={cn('grid max-h-[60vh] overflow-y-auto rounded-xl border border-navy-100', powerColumns.negative.length && powerColumns.positive.length ? 'grid-cols-2' : 'grid-cols-1')}>
          {powerColumns.negative.length > 0 && <div>
            <p className="sticky top-0 border-b border-navy-100 bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-wide text-navy-500">Negative</p>
            {powerColumns.negative.map((value) => (
              <button key={value} type="button" onClick={() => { setValue(picker.eye, value); setPicker(null); }} className="block w-full border-b border-r border-navy-100 px-4 py-3 text-left text-sm font-medium text-navy-700 hover:bg-brand-50 hover:text-brand-700">{value}</button>
            ))}
          </div>}
          {powerColumns.positive.length > 0 && <div>
            <p className="sticky top-0 border-b border-navy-100 bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-wide text-navy-500">Zero &amp; positive</p>
            {powerColumns.positive.map((value) => (
              <button key={value} type="button" onClick={() => { setValue(picker.eye, value); setPicker(null); }} className="block w-full border-b border-navy-100 px-4 py-3 text-left text-sm font-medium text-navy-700 hover:bg-brand-50 hover:text-brand-700">{value}</button>
            ))}
          </div>}
        </div>
      </Modal>
    </div>
  );
}

export default ContactLensConfigurator;
