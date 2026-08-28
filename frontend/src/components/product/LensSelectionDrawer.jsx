import { useEffect, useMemo, useState } from 'react';
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiEye,
  FiFileText,
  FiMonitor,
  FiSliders,
  FiUpload,
} from 'react-icons/fi';
import { Button, Drawer, Input } from '@/components/ui';
import { cn } from '@/utils/cn';

const LENS_PACKAGES = [
  {
    id: 'anti-glare',
    name: 'Anti-Glare Premium',
    price: 0,
    badge: 'Included',
    features: ['Double-sided anti-glare', 'Scratch resistant'],
    icon: FiEye,
  },
  {
    id: 'blu-screen',
    name: 'BLU Screen Protection',
    price: 250,
    badge: 'Screen favourite',
    features: ['Blue-light filtering', 'Reduces eye strain'],
    icon: FiMonitor,
  },
  {
    id: 'photochromic',
    name: 'Photochromic Comfort',
    price: 1000,
    badge: 'Outdoor ready',
    features: ['Darkens in sunlight', 'UV protection'],
    icon: FiSliders,
  },
];

const POWER_COPY = {
  'single-vision': 'Positive, negative or cylindrical',
  'zero-power': 'Screen glasses with no prescription',
  progressive: 'Two powers in one lens',
  bifocal: 'Near and distance correction',
  'frame-only': 'Frame with no lenses',
};

const STEPS = ['Power type', 'Lenses', 'Add power'];

/** Guided lens/prescription configuration for the product details page. */
export function LensSelectionDrawer({ open, onClose, options = [], selectedOption, onComplete }) {
  const [step, setStep] = useState(0);
  const [powerType, setPowerType] = useState('');
  const [packageId, setPackageId] = useState(LENS_PACKAGES[0].id);
  const [prescriptionMethod, setPrescriptionMethod] = useState('later');
  const [fileName, setFileName] = useState('');
  const [prescription, setPrescription] = useState({ leftEye: { sph: '', cyl: '', axis: '' }, rightEye: { sph: '', cyl: '', axis: '' }, pd: '' });

  const selectedPower = useMemo(
    () => options.find((option) => option.type === powerType) || options[0],
    [options, powerType]
  );
  const selectedPackage = LENS_PACKAGES.find((item) => item.id === packageId) || LENS_PACKAGES[0];
  const needsPrescription = !['zero-power', 'frame-only'].includes(selectedPower?.type);

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setPowerType(selectedOption?.baseType || selectedOption?.type || options[0]?.type || '');
    setPackageId(LENS_PACKAGES[0].id);
    setPrescriptionMethod('later');
    setFileName('');
    setPrescription({ leftEye: { sph: '', cyl: '', axis: '' }, rightEye: { sph: '', cyl: '', axis: '' }, pd: '' });
  }, [open, options, selectedOption]);

  const updateEye = (eye, field, value) => {
    setPrescription((current) => ({ ...current, [eye]: { ...current[eye], [field]: value } }));
  };

  const finish = () => {
    const lensOption = {
      ...selectedPower,
      type: `${selectedPower.type}:${selectedPackage.id}`,
      baseType: selectedPower.type,
      label: `${selectedPower.label} · ${selectedPackage.name}`,
      subtitle: selectedPackage.features[0],
      price: Number(selectedPower.price || 0) + selectedPackage.price,
      packageId: selectedPackage.id,
    };
    const prescriptionData = needsPrescription
      ? prescriptionMethod === 'manual'
        ? { ...prescription, method: 'manual' }
        : { method: prescriptionMethod, fileName: prescriptionMethod === 'upload' ? fileName : undefined }
      : undefined;

    onComplete({ lensOption, prescription: prescriptionData });
    onClose();
  };

  const footer = (
    <div className="flex items-center justify-between gap-3">
      {step > 0 ? <Button variant="ghost" onClick={() => setStep((value) => value - 1)} leftIcon={<FiArrowLeft />}>Back</Button> : <span />}
      {step < 2 ? (
        <Button onClick={() => setStep((value) => value + 1)} rightIcon={<FiArrowRight />}>Continue</Button>
      ) : (
        <Button onClick={finish} leftIcon={<FiCheck />}>Use these lenses</Button>
      )}
    </div>
  );

  return (
    <Drawer open={open} onClose={onClose} title={step === 0 ? 'Select Lens Type' : step === 1 ? 'Choose Lens Package' : 'Add Eye Power'} width="max-w-xl" footer={footer}>
      <div className="p-5 sm:p-6">
        <ol className="mb-7 grid grid-cols-3 border-b border-navy-100">
          {STEPS.map((label, index) => (
            <li key={label} className={cn('relative pb-3 text-center text-xs font-semibold sm:text-sm', index === step ? 'text-brand-700' : index < step ? 'text-success-dark' : 'text-navy-400')}>
              <span className={cn('mx-auto mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs', index < step ? 'bg-success text-white' : index === step ? 'bg-brand-500 text-white' : 'bg-navy-100 text-navy-500')}>
                {index < step ? <FiCheck /> : index + 1}
              </span>
              {label}
              {index === step && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-brand-500" />}
            </li>
          ))}
        </ol>

        {step === 0 && (
          <div>
            <h3 className="text-h4 text-navy-900">Select your power type</h3>
            <p className="mt-1 text-sm text-navy-500">Choose how you would like this frame prepared.</p>
            <div className="mt-5 space-y-3">
              {options.map((option) => {
                const active = option.type === powerType;
                return (
                  <button key={option.type} type="button" onClick={() => setPowerType(option.type)} className={cn('flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition', active ? 'border-brand-500 bg-brand-50 shadow-soft' : 'border-navy-200 hover:border-brand-300')}>
                    <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', active ? 'bg-brand-500 text-white' : 'bg-surface-muted text-brand-700')}><FiEye className="h-5 w-5" /></span>
                    <span className="min-w-0 flex-1"><span className="block font-semibold text-navy-900">{option.label}</span><span className="mt-0.5 block text-sm text-navy-500">{option.subtitle || POWER_COPY[option.type] || 'Custom lens option'}</span></span>
                    <FiArrowRight className="shrink-0 text-navy-400" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h3 className="text-h4 text-navy-900">Choose your lens package</h3>
            <p className="mt-1 text-sm text-navy-500">Your frame is paired with {selectedPower?.label || 'your chosen'} lenses.</p>
            <div className="mt-5 flex gap-2 overflow-x-auto pb-1 text-xs font-semibold">
              <span className="shrink-0 rounded-full bg-navy-900 px-3 py-2 text-white">Bestsellers</span>
              <span className="shrink-0 rounded-full border border-navy-200 px-3 py-2 text-navy-600">Work friendly</span>
              <span className="shrink-0 rounded-full border border-navy-200 px-3 py-2 text-navy-600">High power</span>
            </div>
            <div className="mt-4 space-y-3">
              {LENS_PACKAGES.map((item) => {
                const Icon = item.icon;
                const active = item.id === packageId;
                return (
                  <button key={item.id} type="button" onClick={() => setPackageId(item.id)} className={cn('flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition', active ? 'border-brand-500 bg-brand-50 shadow-soft' : 'border-navy-200 hover:border-brand-300')}>
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-brand-700"><Icon className="h-6 w-6" /></span>
                    <span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2"><span className="font-semibold text-navy-900">{item.name}</span><span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">{item.badge}</span></span><span className="mt-1 block text-sm text-navy-500">{item.features.join(' · ')}</span><span className="mt-2 block text-sm font-semibold text-navy-800">{item.price ? `Add ₹${item.price}` : 'Included'}</span></span>
                    {active && <FiCheck className="mt-1 shrink-0 text-brand-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="text-h4 text-navy-900">{needsPrescription ? 'How would you like to provide your power?' : 'Your lens selection is ready'}</h3>
            {needsPrescription ? (
              <>
                <p className="mt-1 text-sm text-navy-500">Choose a convenient prescription method. You can change this before checkout.</p>
                <div className="mt-5 space-y-3">
                  <button type="button" onClick={() => setPrescriptionMethod('later')} className={cn('flex w-full items-center gap-4 rounded-2xl border p-4 text-left', prescriptionMethod === 'later' ? 'border-brand-500 bg-brand-50' : 'border-navy-200')}><FiFileText className="h-6 w-6 text-brand-600" /><span><span className="block font-semibold text-navy-900">Submit power later</span><span className="text-sm text-navy-500">Provide your prescription after placing the order.</span></span></button>
                  <button type="button" onClick={() => setPrescriptionMethod('manual')} className={cn('flex w-full items-center gap-4 rounded-2xl border p-4 text-left', prescriptionMethod === 'manual' ? 'border-brand-500 bg-brand-50' : 'border-navy-200')}><FiSliders className="h-6 w-6 text-brand-600" /><span><span className="block font-semibold text-navy-900">Enter power manually</span><span className="text-sm text-navy-500">Use values from your latest eye prescription.</span></span></button>
                  <label className={cn('flex cursor-pointer items-center gap-4 rounded-2xl border p-4 text-left', prescriptionMethod === 'upload' ? 'border-brand-500 bg-brand-50' : 'border-navy-200')}><FiUpload className="h-6 w-6 text-brand-600" /><span className="min-w-0 flex-1"><span className="block font-semibold text-navy-900">Upload prescription</span><span className="block truncate text-sm text-navy-500">{fileName || 'Choose an image or PDF to attach at checkout.'}</span></span><input type="file" accept="image/*,.pdf" className="sr-only" onChange={(event) => { setPrescriptionMethod('upload'); setFileName(event.target.files?.[0]?.name || ''); }} /></label>
                </div>
                {prescriptionMethod === 'manual' && (
                  <div className="mt-5 rounded-2xl bg-surface-muted p-4"><p className="mb-3 text-sm font-semibold text-navy-800">Prescription details</p><div className="grid gap-3 sm:grid-cols-3"><Input label="Left SPH" value={prescription.leftEye.sph} onChange={(event) => updateEye('leftEye', 'sph', event.target.value)} /><Input label="Left CYL" value={prescription.leftEye.cyl} onChange={(event) => updateEye('leftEye', 'cyl', event.target.value)} /><Input label="Left Axis" value={prescription.leftEye.axis} onChange={(event) => updateEye('leftEye', 'axis', event.target.value)} /><Input label="Right SPH" value={prescription.rightEye.sph} onChange={(event) => updateEye('rightEye', 'sph', event.target.value)} /><Input label="Right CYL" value={prescription.rightEye.cyl} onChange={(event) => updateEye('rightEye', 'cyl', event.target.value)} /><Input label="Right Axis" value={prescription.rightEye.axis} onChange={(event) => updateEye('rightEye', 'axis', event.target.value)} /><div className="sm:col-span-3"><Input label="PD (mm)" value={prescription.pd} onChange={(event) => setPrescription((current) => ({ ...current, pd: event.target.value }))} /></div></div></div>
                )}
              </>
            ) : (
              <div className="mt-5 rounded-2xl bg-brand-50 p-5 text-sm text-brand-800"><FiCheck className="mb-2 h-6 w-6" />No prescription is needed for this choice. Add the configured frame and lens package to your cart.</div>
            )}
          </div>
        )}
      </div>
    </Drawer>
  );
}

export default LensSelectionDrawer;
