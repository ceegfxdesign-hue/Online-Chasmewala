import { useEffect, useMemo, useState } from 'react';
import { FiChevronRight, FiUpload } from 'react-icons/fi';
import { Modal } from '@/components/ui';
import { cn } from '@/utils/cn';

const POWER_STEP = 0.25;
const DEFAULT_NEGATIVE_LIMIT = -3;
const DEFAULT_POSITIVE_LIMIT = 3;
const EYES = [
  { key: 'right', label: 'Right', value: 'Right eye' },
  { key: 'left', label: 'Left', value: 'Left eye' },
];

function getSphericalPowerColumns(sphericalPowerMin, sphericalPowerMax) {
  const negativeLimit = Math.max(-20, Math.min(0, Number(sphericalPowerMin ?? DEFAULT_NEGATIVE_LIMIT)));
  const positiveLimit = Math.max(0, Math.min(20, Number(sphericalPowerMax ?? DEFAULT_POSITIVE_LIMIT)));
  const negative = [];
  const positive = ['0.00'];

  for (let value = -POWER_STEP; value >= negativeLimit; value -= POWER_STEP) {
    negative.push(value.toFixed(2));
  }
  for (let value = POWER_STEP; value <= positiveLimit; value += POWER_STEP) {
    positive.push(`+${value.toFixed(2)}`);
  }

  return { negative, positive };
}

export function ContactLensConfigurator({ product, onChange, onGalleryImages }) {
  const config = product.contactLens || {};
  const packs = config.packOptions?.length ? config.packOptions : [];
  const powerModes = config.powerModes?.length ? config.powerModes : ['with-power'];
  const [powerMode, setPowerMode] = useState(powerModes[0]);
  const [packIndex, setPackIndex] = useState(0);
  const [colourIndex, setColourIndex] = useState(0);
  const [method, setMethod] = useState('manual');
  const [values, setValues] = useState({});
  const [selectedEyes, setSelectedEyes] = useState({ right: true, left: true });
  const [picker, setPicker] = useState(null);
  const [fileName, setFileName] = useState('');
  const fields = config.prescriptionFields?.length ? config.prescriptionFields : ['Spherical', 'SPH'];
  const colours = useMemo(() => config.availableColors || [], [config.availableColors]);
  const selectedPack = packs[packIndex] || packs[0];
  const powerColumns = useMemo(
    () => getSphericalPowerColumns(config.sphericalPowerMin, config.sphericalPowerMax),
    [config.sphericalPowerMax, config.sphericalPowerMin]
  );

  useEffect(() => {
    setPowerMode(powerModes[0]);
    setPackIndex(0);
    setColourIndex(0);
    setMethod('manual');
    setValues({});
    setSelectedEyes({ right: true, left: true });
    setFileName('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product._id]);

  useEffect(() => {
    onChange({
      type: `contact-${config.kind || 'clear'}-${powerMode}-${packIndex}-${colourIndex}`,
      label: [powerMode === 'with-power' ? 'With Power' : 'Zero Power', selectedPack?.label]
        .filter(Boolean)
        .join(' · '),
      price: selectedPack ? Math.max(0, Number(selectedPack.price ?? product.price) - Number(product.price)) : 0,
      packageId: selectedPack ? `contact-${packIndex}` : undefined,
      prescription: method === 'upload' ? { method: 'upload', fileName } : { method: 'manual', values },
      colour: colours[colourIndex]?.name,
    });
  }, [colourIndex, colours, config.kind, fileName, method, onChange, packIndex, powerMode, product.price, selectedPack, values]);

  useEffect(() => {
    const images = colours[colourIndex]?.images;
    onGalleryImages(images?.length ? images : null);
  }, [colourIndex, colours, onGalleryImages]);

  const requiresPower = powerMode === 'with-power';
  const setValue = (eye, value) => {
    const field = picker?.field || 'Power';
    setValues((current) => ({ ...current, [`${field}:${eye}`]: value }));
  };

  return (
    <div className="mt-6 space-y-5 border-t border-navy-100 pt-5">
      {(config.kind === 'clear' || config.kind === 'color') && (
        <div>
          <p className="mb-2 text-sm font-semibold text-navy-900">Power type</p>
          <div className="flex flex-wrap gap-2">
            {powerModes.map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setPowerMode(mode)}
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
            <label className="flex cursor-pointer items-center gap-3 border-b border-navy-100 px-3 py-3 text-sm font-semibold text-navy-900">
              <input type="radio" checked={method === 'manual'} onChange={() => setMethod('manual')} className="accent-navy-900" />
              Enter power manually
            </label>
            {method === 'manual' && (
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
                {fields.map((field) => (
                  <div key={field} className="grid grid-cols-[minmax(0,1fr)_repeat(2,minmax(0,1fr))] items-center gap-2">
                    <p className="text-sm font-semibold text-navy-800">{field}</p>
                    {EYES.map((eye) => (
                      <button
                        key={eye.key}
                        type="button"
                        disabled={!selectedEyes[eye.key]}
                        onClick={() => setPicker({ field, eye: eye.value })}
                        className="flex min-w-0 items-center justify-between rounded-lg border border-navy-200 px-3 py-2.5 text-left text-sm text-navy-600 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <span className="truncate">{values[`${field}:${eye.value}`] || 'Select'}</span>
                        <FiChevronRight className="shrink-0" />
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
            <label className="flex cursor-pointer items-center gap-3 px-3 py-3 text-sm font-semibold text-navy-900">
              <input type="radio" checked={method === 'upload'} onChange={() => setMethod('upload')} className="accent-navy-900" />
              Upload prescription
            </label>
            {method === 'upload' && (
              <div className="px-3 pb-4">
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-navy-300 bg-surface px-4 py-3 text-sm font-semibold text-navy-800">
                  <FiUpload />
                  {fileName || 'Upload Prescription'}
                  <input type="file" accept="image/*,.pdf" className="sr-only" onChange={(event) => setFileName(event.target.files?.[0]?.name || '')} />
                </label>
              </div>
            )}
          </div>
        </div>
      )}

      {config.kind === 'color' && colours.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-navy-900">Available colors</p>
          <div className="flex flex-wrap gap-2">
            {colours.map((color, index) => (
              <button key={`${color.name}-${index}`} type="button" onClick={() => setColourIndex(index)} className={cn('rounded-xl border px-3 py-2 text-left text-xs font-semibold', colourIndex === index ? 'border-navy-900 bg-navy-50 text-navy-900' : 'border-navy-100 text-navy-600')}>
                <span className="mb-1 block h-5 w-5 rounded-full border border-white shadow-soft" style={{ backgroundColor: color.hex || '#9CA3AF' }} />
                {color.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {packs.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-navy-900">{config.kind === 'solution' ? 'Quantity' : config.kind === 'accessory' ? 'Select option' : 'Lenses per pack'}</p>
          <div className="flex flex-wrap gap-2">
            {packs.map((pack, index) => (
              <button key={`${pack.label}-${index}`} type="button" onClick={() => setPackIndex(index)} className={cn('min-w-28 rounded-xl border p-3 text-left text-sm', packIndex === index ? 'border-navy-900 bg-navy-50 text-navy-900' : 'border-navy-100 bg-surface text-navy-600')}>
                <span className="block font-semibold">{pack.label}</span>
                <span className="mt-1 block text-xs">₹{Number(pack.price ?? product.price).toLocaleString('en-IN')}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <Modal open={Boolean(picker)} onClose={() => setPicker(null)} title={`${picker?.field || 'Power'} · ${picker?.eye || ''}`} size="sm">
        <div className="grid max-h-[60vh] grid-cols-2 overflow-y-auto rounded-xl border border-navy-100">
          <div>
            <p className="sticky top-0 border-b border-navy-100 bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-wide text-navy-500">Negative</p>
            {powerColumns.negative.map((value) => (
              <button key={value} type="button" onClick={() => { setValue(picker.eye, value); setPicker(null); }} className="block w-full border-b border-r border-navy-100 px-4 py-3 text-left text-sm font-medium text-navy-700 hover:bg-brand-50 hover:text-brand-700">{value}</button>
            ))}
          </div>
          <div>
            <p className="sticky top-0 border-b border-navy-100 bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-wide text-navy-500">Zero &amp; positive</p>
            {powerColumns.positive.map((value) => (
              <button key={value} type="button" onClick={() => { setValue(picker.eye, value); setPicker(null); }} className="block w-full border-b border-navy-100 px-4 py-3 text-left text-sm font-medium text-navy-700 hover:bg-brand-50 hover:text-brand-700">{value}</button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ContactLensConfigurator;
