import { useEffect, useMemo, useState } from 'react';
import { FiChevronRight, FiUpload } from 'react-icons/fi';
import { Modal } from '@/components/ui';
import { cn } from '@/utils/cn';

const defaultPowerValues = ['-0.25', '-0.50', '-0.75', '-1.00', '-1.25', '-1.50', '-1.75', '-2.00', '-2.25', '-2.50', '-2.75', '-3.00', '0.00', '+0.25', '+0.50', '+0.75', '+1.00', '+1.25', '+1.50', '+1.75', '+2.00', '+2.25', '+2.50', '+2.75', '+3.00'];

export function ContactLensConfigurator({ product, onChange, onGalleryImages }) {
  const config = product.contactLens || {};
  const packs = config.packOptions?.length ? config.packOptions : [{ label: config.lensesPerBox ? `${config.lensesPerBox} lenses/box` : 'Standard pack', units: config.lensesPerBox || 1, price: product.price, mrp: product.mrp }];
  const powerModes = config.powerModes?.length ? config.powerModes : ['with-power'];
  const [powerMode, setPowerMode] = useState(powerModes[0]);
  const [packIndex, setPackIndex] = useState(0);
  const [colourIndex, setColourIndex] = useState(0);
  const [method, setMethod] = useState('manual');
  const [values, setValues] = useState({});
  const [picker, setPicker] = useState(null);
  const [fileName, setFileName] = useState('');
  const fields = config.prescriptionFields?.length ? config.prescriptionFields : ['Spherical', 'SPH'];
  const colours = useMemo(() => config.availableColors || [], [config.availableColors]);
  const selectedPack = packs[packIndex] || packs[0];

  useEffect(() => {
    setPowerMode(powerModes[0]); setPackIndex(0); setColourIndex(0); setMethod('manual'); setValues({}); setFileName('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product._id]);

  useEffect(() => {
    const selection = {
      type: `contact-${config.kind || 'clear'}-${powerMode}-${packIndex}-${colourIndex}`,
      label: [powerMode === 'with-power' ? 'With Power' : 'Zero Power', selectedPack?.label].filter(Boolean).join(' · '),
      price: Math.max(0, Number(selectedPack?.price ?? product.price) - Number(product.price)),
      packageId: `contact-${packIndex}`,
      prescription: method === 'upload' ? { method: 'upload', fileName } : { method: 'manual', values },
      colour: colours[colourIndex]?.name,
    };
    onChange(selection);
  }, [colourIndex, colours, config.kind, fileName, method, onChange, packIndex, powerMode, product.price, selectedPack, values]);

  useEffect(() => {
    const images = colours[colourIndex]?.images;
    if (images?.length) onGalleryImages(images);
    else onGalleryImages(null);
  }, [colourIndex, colours, onGalleryImages]);

  const fieldLabel = picker?.field || 'Power';
  const setValue = (eye, value) => setValues((current) => ({ ...current, [`${fieldLabel}:${eye}`]: value }));
  const requiresPower = powerMode === 'with-power';

  return (
    <div className="mt-6 space-y-5 border-t border-navy-100 pt-5">
      {(config.kind === 'clear' || config.kind === 'color') && (
        <div>
          <p className="mb-2 text-sm font-semibold text-navy-900">Power type</p>
          <div className="flex flex-wrap gap-2">{powerModes.map((mode) => <button key={mode} type="button" onClick={() => setPowerMode(mode)} className={cn('rounded-full border px-4 py-2 text-sm font-semibold', powerMode === mode ? 'border-navy-900 bg-navy-900 text-white' : 'border-navy-200 bg-surface text-navy-700')}>{mode === 'with-power' ? 'With Power' : 'Zero Power'}</button>)}</div>
        </div>
      )}

      {requiresPower && (
        <div className="rounded-2xl bg-navy-50 p-3 sm:p-4">
          <div className="overflow-hidden rounded-xl border border-navy-100 bg-surface">
            <label className="flex cursor-pointer items-center gap-3 border-b border-navy-100 px-3 py-3 text-sm font-semibold text-navy-900"><input type="radio" checked={method === 'manual'} onChange={() => setMethod('manual')} className="accent-navy-900" />Enter power manually</label>
            {method === 'manual' && <div className="space-y-3 px-3 py-4">{fields.map((field) => <div key={field}><p className="mb-2 text-sm font-semibold text-navy-800">{field}</p><div className="grid grid-cols-2 gap-2">{['Right eye', 'Left eye'].map((eye) => <button key={eye} type="button" onClick={() => setPicker({ field, eye })} className="flex items-center justify-between rounded-lg border border-navy-200 px-3 py-2.5 text-left text-sm text-navy-600">{values[`${field}:${eye}`] || `Select ${field}`}<FiChevronRight /></button>)}</div></div>)}</div>}
            <label className="flex cursor-pointer items-center gap-3 px-3 py-3 text-sm font-semibold text-navy-900"><input type="radio" checked={method === 'upload'} onChange={() => setMethod('upload')} className="accent-navy-900" />Upload prescription</label>
            {method === 'upload' && <div className="px-3 pb-4"><label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-navy-300 bg-surface px-4 py-3 text-sm font-semibold text-navy-800"><FiUpload />{fileName || 'Upload Prescription'}<input type="file" accept="image/*,.pdf" className="sr-only" onChange={(event) => setFileName(event.target.files?.[0]?.name || '')} /></label></div>}
          </div>
        </div>
      )}

      {config.kind === 'color' && colours.length > 0 && <div><p className="mb-2 text-sm font-semibold text-navy-900">Available colors</p><div className="flex flex-wrap gap-2">{colours.map((color, index) => <button key={`${color.name}-${index}`} type="button" onClick={() => setColourIndex(index)} className={cn('rounded-xl border px-3 py-2 text-left text-xs font-semibold', colourIndex === index ? 'border-navy-900 bg-navy-50 text-navy-900' : 'border-navy-100 text-navy-600')}><span className="mb-1 block h-5 w-5 rounded-full border border-white shadow-soft" style={{ backgroundColor: color.hex || '#9CA3AF' }} />{color.name}</button>)}</div></div>}

      <div><p className="mb-2 text-sm font-semibold text-navy-900">{config.kind === 'solution' ? 'Quantity' : config.kind === 'accessory' ? 'Select option' : 'Lenses per pack'}</p><div className="flex flex-wrap gap-2">{packs.map((pack, index) => <button key={`${pack.label}-${index}`} type="button" onClick={() => setPackIndex(index)} className={cn('min-w-28 rounded-xl border p-3 text-left text-sm', packIndex === index ? 'border-navy-900 bg-navy-50 text-navy-900' : 'border-navy-100 bg-surface text-navy-600')}><span className="block font-semibold">{pack.label}</span><span className="mt-1 block text-xs">₹{Number(pack.price ?? product.price).toLocaleString('en-IN')}</span></button>)}</div></div>

      <Modal open={Boolean(picker)} onClose={() => setPicker(null)} title={`${picker?.field || 'Power'} · ${picker?.eye || ''}`} size="sm"><div className="grid max-h-[60vh] grid-cols-2 overflow-y-auto rounded-xl border border-navy-100">{defaultPowerValues.map((value) => <button key={value} type="button" onClick={() => { setValue(picker.eye, value); setPicker(null); }} className="border-b border-r border-navy-100 px-4 py-3 text-left text-sm font-medium text-navy-700 hover:bg-brand-50 hover:text-brand-700">{value}</button>)}</div></Modal>
    </div>
  );
}

export default ContactLensConfigurator;
