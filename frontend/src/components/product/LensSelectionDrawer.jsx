import { useEffect, useMemo, useState } from 'react';
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiEye,
  FiFileText,
  FiImage,
  FiShield,
  FiUpload,
} from 'react-icons/fi';
import { Button, Drawer, Select } from '@/components/ui';
import { formatPrice } from '@/lib/format';
import { cn } from '@/utils/cn';

const DEFAULT_LENS_PACKAGES = [
  {
    id: 'anti-glare',
    name: 'Anti-Glare Premium',
    description: 'Clear everyday lenses with dependable protection.',
    price: 0,
    mrp: 0,
    badge: 'Included',
    features: ['Double-sided anti-glare', 'Scratch resistant'],
    warrantyMonths: 6,
    tags: ['Bestsellers'],
    powerTypes: ['single-vision', 'zero-power', 'progressive'],
  },
  {
    id: 'blu-screen',
    name: 'BLU Screen Protection',
    description: 'Comfortable lenses for phones, laptops and other screens.',
    price: 250,
    mrp: 500,
    badge: 'Screen favourite',
    features: ['Blue-light filtering', 'Reduces eye strain'],
    warrantyMonths: 12,
    tags: ['Bestsellers', 'Work friendly'],
    powerTypes: ['single-vision', 'zero-power', 'progressive'],
  },
  {
    id: 'photochromic',
    name: 'Photochromic Comfort',
    description: 'Adaptive lenses for changing indoor and outdoor light.',
    price: 1000,
    mrp: 1500,
    badge: 'Outdoor ready',
    features: ['Darkens in sunlight', 'UV protection'],
    warrantyMonths: 12,
    tags: ['High power'],
    powerTypes: ['single-vision', 'zero-power', 'progressive'],
  },
];

const DEFAULT_PRESCRIPTION_FIELDS = [
  { key: 'sph', label: 'SPH', min: -20, max: 20, step: 0.25, scope: 'per-eye', required: true, powerTypes: ['single-vision', 'progressive'] },
  { key: 'cyl', label: 'CYL', min: -6, max: 0, step: 0.25, scope: 'per-eye', required: false, powerTypes: ['single-vision', 'progressive'] },
  { key: 'axis', label: 'Axis', min: 0, max: 180, step: 1, scope: 'per-eye', required: false, powerTypes: ['single-vision', 'progressive'] },
  { key: 'pd', label: 'PD', min: 45, max: 80, step: 1, scope: 'shared', required: true, powerTypes: ['single-vision', 'progressive'] },
  { key: 'add', label: 'ADD', min: 0.5, max: 4, step: 0.25, scope: 'per-eye', required: true, powerTypes: ['progressive'] },
];

const POWER_COPY = {
  'single-vision': 'Positive, negative or cylindrical',
  'with-power': 'Positive, negative or cylindrical',
  'zero-power': 'Screen glasses with no prescription',
  progressive: 'Two powers in one lens',
  bifocal: 'Near and distance correction',
  'frame-only': 'Frame with no lenses',
};

const STEPS = ['Power type', 'Lenses', 'Add power'];
const MAX_PRESCRIPTION_FILE_BYTES = 2 * 1024 * 1024;
const MAX_PRESCRIPTION_DATA_URL_LENGTH = 2_800_000;
const PRESCRIPTION_FILE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);

export function readPrescriptionFile(file) {
  return new Promise((resolve, reject) => {
    if (!file || !PRESCRIPTION_FILE_TYPES.has(file.type)) {
      reject(new Error('Choose a JPG, PNG, WebP, or PDF prescription.'));
      return;
    }
    if (file.size > MAX_PRESCRIPTION_FILE_BYTES) {
      reject(new Error('Prescription files must be 2 MB or smaller.'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('The prescription file could not be read.'));
    reader.onload = () => {
      const fileData = String(reader.result || '');
      if (!fileData.startsWith(`data:${file.type};base64,`) || fileData.length > MAX_PRESCRIPTION_DATA_URL_LENGTH) {
        reject(new Error('The prescription file is invalid or too large.'));
        return;
      }
      resolve({ fileName: file.name, mimeType: file.type, fileData });
    };
    reader.readAsDataURL(file);
  });
}

const isAllowedForPowerType = (item, powerType) => {
  const allowed = Array.isArray(item?.powerTypes) ? item.powerTypes : [];
  return (
    allowed.length === 0 ||
    allowed.some((type) => String(type).toLowerCase() === 'all') ||
    allowed.includes(powerType)
  );
};

const needsPrescriptionFor = (option) => {
  if (typeof option?.requiresPrescription === 'boolean') return option.requiresPrescription;
  return !['zero-power', 'frame-only'].includes(option?.type);
};

const packagesForPowerType = (items, powerType) => (
  powerType === 'frame-only' ? [] : items.filter((item) => isAllowedForPowerType(item, powerType))
);

const decimalPlaces = (number) => {
  const value = String(number);
  if (value.includes('e-')) return Number(value.split('e-')[1]);
  return value.includes('.') ? value.split('.')[1].length : 0;
};

/** Build stable string choices without accumulating floating-point errors. */
export function buildPowerChoices(field) {
  const min = Number(field?.min);
  const max = Number(field?.max);
  const step = Number(field?.step);
  if (!Number.isFinite(min) || !Number.isFinite(max) || !Number.isFinite(step) || step <= 0 || min > max) return [];

  const precision = Math.min(4, Math.max(decimalPlaces(min), decimalPlaces(max), decimalPlaces(step)));
  const intervals = Math.floor((max - min) / step + 1e-8);
  const values = [];
  for (let index = 0; index <= intervals && index < 5000; index += 1) {
    const numeric = Number((min + index * step).toFixed(precision));
    const fixed = numeric.toFixed(precision);
    values.push(min < 0 && numeric > 0 ? `+${fixed}` : fixed);
  }
  return values;
}

const fieldSnapshotKey = (field, eye) => eye ? `${eye} eye · ${field.label}` : field.label;

const getCaseInsensitiveValue = (object, key) => {
  if (!object || typeof object !== 'object') return undefined;
  const actualKey = Object.keys(object).find((candidate) => candidate.toLowerCase() === String(key).toLowerCase());
  return actualKey === undefined ? undefined : object[actualKey];
};

const restorePrescriptionValues = (selectedPrescription, fields) => {
  const source = selectedPrescription?.values || selectedPrescription || {};
  const restored = {};

  Object.entries(source).forEach(([key, value]) => {
    if (typeof value === 'string' || typeof value === 'number') {
      if (!['method', 'fileName', 'mimeType', 'fileData'].includes(key)) restored[key] = String(value);
    }
  });

  fields.forEach((field) => {
    if (field.scope === 'per-eye') {
      ['Right', 'Left'].forEach((eye) => {
        const snapshotKey = fieldSnapshotKey(field, eye);
        const legacyEye = getCaseInsensitiveValue(source, `${eye.toLowerCase()}Eye`);
        const legacyValue = getCaseInsensitiveValue(legacyEye, field.key);
        if (restored[snapshotKey] === undefined && legacyValue !== undefined) {
          restored[snapshotKey] = String(legacyValue);
        }
      });
    } else {
      const snapshotKey = fieldSnapshotKey(field);
      const legacyValue = getCaseInsensitiveValue(source, field.key);
      if (restored[snapshotKey] === undefined && legacyValue !== undefined) {
        restored[snapshotKey] = String(legacyValue);
      }
    }
  });

  return restored;
};

const warrantyLabel = (months) => {
  const value = Number(months);
  if (!value) return '';
  if (value % 12 === 0) return `${value / 12} year${value === 12 ? '' : 's'} warranty`;
  return `${value} month${value === 1 ? '' : 's'} warranty`;
};

/** Guided, admin-configured lens and manual-prescription flow. */
export function LensSelectionDrawer({
  open,
  onClose,
  options,
  packages,
  prescriptionFields,
  selectedOption,
  selectedPrescription,
  onComplete,
}) {
  const activeOptions = useMemo(
    () => (Array.isArray(options) ? options : []).filter((option) => option?.isActive !== false && option?.type),
    [options]
  );
  const availablePackages = useMemo(() => {
    const configured = Array.isArray(packages) && packages.length ? packages : DEFAULT_LENS_PACKAGES;
    return configured.filter((item) => item?.isActive !== false && (item?.id || item?._id));
  }, [packages]);
  const availableFields = useMemo(() => {
    const configured = Array.isArray(prescriptionFields) && prescriptionFields.length
      ? prescriptionFields
      : DEFAULT_PRESCRIPTION_FIELDS;
    return configured.filter((field) => field?.isActive !== false && field?.key && field?.label);
  }, [prescriptionFields]);

  const [step, setStep] = useState(0);
  const [powerType, setPowerType] = useState('');
  const [packageId, setPackageId] = useState('');
  const [activeTag, setActiveTag] = useState('all');
  const [prescriptionValues, setPrescriptionValues] = useState({});
  const [prescriptionMethod, setPrescriptionMethod] = useState('manual');
  const [uploadedPrescription, setUploadedPrescription] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);

  const selectedPower = useMemo(
    () => activeOptions.find((option) => option.type === powerType) || activeOptions[0],
    [activeOptions, powerType]
  );
  const compatiblePackages = useMemo(
    () => packagesForPowerType(availablePackages, selectedPower?.type),
    [availablePackages, selectedPower?.type]
  );
  const selectedPackage = useMemo(
    () => compatiblePackages.find((item) => (item.id || item._id) === packageId),
    [compatiblePackages, packageId]
  );
  const applicableFields = useMemo(
    () => availableFields.filter((field) => isAllowedForPowerType(field, selectedPower?.type)),
    [availableFields, selectedPower?.type]
  );
  const tags = useMemo(
    () => Array.from(new Set(compatiblePackages.flatMap((item) => Array.isArray(item.tags) ? item.tags : []).filter(Boolean))),
    [compatiblePackages]
  );
  const filteredPackages = useMemo(
    () => activeTag === 'all'
      ? compatiblePackages
      : compatiblePackages.filter((item) => item.tags?.includes(activeTag)),
    [activeTag, compatiblePackages]
  );
  const needsPrescription = needsPrescriptionFor(selectedPower);
  const noPackageRequired = selectedPower?.type === 'frame-only';
  const selectionReady = Boolean(selectedPackage) || noPackageRequired;

  useEffect(() => {
    if (!open) return;
    const requestedType = selectedOption?.powerTypeId || selectedOption?.baseType || selectedOption?.type?.split(':')[0];
    const initialPower = activeOptions.find((option) => option.type === requestedType) || activeOptions[0];
    const matchingPackages = packagesForPowerType(availablePackages, initialPower?.type);
    const requestedPackage = selectedOption?.packageId;
    const initialPackage = matchingPackages.find((item) => (item.id || item._id) === requestedPackage) || matchingPackages[0];

    setStep(0);
    setPowerType(initialPower?.type || '');
    setPackageId(initialPackage?.id || initialPackage?._id || '');
    setActiveTag('all');
    setPrescriptionValues(restorePrescriptionValues(selectedPrescription, availableFields));
    setPrescriptionMethod(selectedPrescription?.method === 'upload' ? 'upload' : 'manual');
    setUploadedPrescription(selectedPrescription?.method === 'upload' && selectedPrescription.fileName
      ? {
          fileName: selectedPrescription.fileName,
          mimeType: selectedPrescription.mimeType || '',
          fileData: selectedPrescription.fileData || '',
        }
      : null);
    setUploadError('');
    setUploading(false);
  }, [open, activeOptions, availablePackages, availableFields, selectedOption, selectedPrescription]);

  useEffect(() => {
    if (!open || !powerType || selectedPackage || compatiblePackages.length === 0) return;
    setPackageId(compatiblePackages[0].id || compatiblePackages[0]._id);
  }, [compatiblePackages, open, powerType, selectedPackage]);

  useEffect(() => {
    if (activeTag === 'all' || tags.includes(activeTag)) return;
    setActiveTag('all');
  }, [activeTag, tags]);

  const selectPowerType = (type) => {
    const matchingPackages = packagesForPowerType(availablePackages, type);
    setPowerType(type);
    setActiveTag('all');
    setPackageId((current) => (
      matchingPackages.some((item) => (item.id || item._id) === current)
        ? current
        : matchingPackages[0]?.id || matchingPackages[0]?._id || ''
    ));
  };

  const updatePrescription = (key, value) => {
    setPrescriptionValues((current) => ({ ...current, [key]: value }));
  };

  const uploadPrescription = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      setUploadedPrescription(await readPrescriptionFile(file));
    } catch (error) {
      setUploadedPrescription(null);
      setUploadError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const hasAnyApplicablePowerValue = applicableFields.some((field) => {
    if (field.scope === 'per-eye') {
      return ['Right', 'Left'].some((eye) => {
        const value = prescriptionValues[fieldSnapshotKey(field, eye)];
        return value !== undefined && value !== '';
      });
    }
    const value = prescriptionValues[fieldSnapshotKey(field)];
    return value !== undefined && value !== '';
  });
  const manualPrescriptionComplete = (
    applicableFields.length > 0 && hasAnyApplicablePowerValue && applicableFields.every((field) => {
      if (!field.required) return true;
      if (field.scope === 'per-eye') {
        return ['Right', 'Left'].every((eye) => prescriptionValues[fieldSnapshotKey(field, eye)] !== undefined && prescriptionValues[fieldSnapshotKey(field, eye)] !== '');
      }
      return prescriptionValues[fieldSnapshotKey(field)] !== undefined && prescriptionValues[fieldSnapshotKey(field)] !== '';
    })
  );
  const uploadPrescriptionComplete = Boolean(
    uploadedPrescription?.fileName && uploadedPrescription?.mimeType && uploadedPrescription?.fileData
  );
  const requiredComplete = !needsPrescription || (
    prescriptionMethod === 'upload' ? uploadPrescriptionComplete : manualPrescriptionComplete
  );

  const finish = () => {
    if (!selectedPower || !selectionReady || !requiredComplete) return;
    const packagePrice = Number(selectedPackage?.price || 0);
    const modePrice = Number(selectedPower.price || 0);
    const packageMrp = Number(selectedPackage?.mrp ?? selectedPackage?.price ?? 0);
    const id = selectedPackage?.id || selectedPackage?._id;
    const features = Array.isArray(selectedPackage?.features) ? selectedPackage.features : [];
    const packageTags = Array.isArray(selectedPackage?.tags) ? selectedPackage.tags : [];
    const lensOption = {
      type: id ? `${selectedPower.type}:${id}` : selectedPower.type,
      baseType: selectedPower.type,
      powerTypeLabel: selectedPower.label,
      ...(id ? { packageId: id, packageName: selectedPackage.name } : {}),
      label: id ? `${selectedPower.label} · ${selectedPackage.name}` : selectedPower.label,
      subtitle: selectedPackage?.description || features[0] || selectedPower.subtitle || '',
      price: modePrice + packagePrice,
      mrp: modePrice + packageMrp,
      badge: selectedPackage?.badge || selectedPower.badge || '',
      image: selectedPackage?.image || '',
      features,
      warrantyMonths: Number(selectedPackage?.warrantyMonths || 0),
      tags: packageTags,
    };
    const completedValues = {};
    applicableFields.forEach((field) => {
      if (field.scope === 'per-eye') {
        ['Right', 'Left'].forEach((eye) => {
          const key = fieldSnapshotKey(field, eye);
          if (prescriptionValues[key] !== undefined && prescriptionValues[key] !== '') {
            completedValues[key] = prescriptionValues[key];
          }
        });
      } else {
        const key = fieldSnapshotKey(field);
        if (prescriptionValues[key] !== undefined && prescriptionValues[key] !== '') {
          completedValues[key] = prescriptionValues[key];
        }
      }
    });
    const prescription = !needsPrescription
      ? undefined
      : prescriptionMethod === 'upload'
        ? { method: 'upload', ...uploadedPrescription }
        : { method: 'manual', values: completedValues };

    onComplete?.({ lensOption, prescription });
    onClose?.();
  };

  const footer = (
    <div className="flex items-center justify-between gap-3">
      {step > 0 ? (
        <Button variant="ghost" onClick={() => setStep((value) => value - 1)} leftIcon={<FiArrowLeft />}>
          Back
        </Button>
      ) : <span />}
      {step < 2 ? (
        <Button
          onClick={() => setStep((value) => value + 1)}
          rightIcon={<FiArrowRight />}
          disabled={step === 0 ? !selectedPower : !selectionReady}
        >
          Continue
        </Button>
      ) : (
        <Button onClick={finish} leftIcon={<FiCheck />} disabled={!selectionReady || !requiredComplete}>
          Use these lenses
        </Button>
      )}
    </div>
  );

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={step === 0 ? 'Select Lens Type' : step === 1 ? 'Choose Lens Package' : 'Add Eye Power'}
      width="max-w-2xl"
      footer={footer}
    >
      <div className="p-5 sm:p-6">
        <ol className="mb-7 grid grid-cols-3 border-b border-navy-100">
          {STEPS.map((label, index) => (
            <li
              key={label}
              aria-current={index === step ? 'step' : undefined}
              className={cn(
                'relative pb-3 text-center text-xs font-semibold sm:text-sm',
                index === step ? 'text-brand-700' : index < step ? 'text-success-dark' : 'text-navy-400'
              )}
            >
              <span className={cn(
                'mx-auto mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs',
                index < step ? 'bg-success text-white' : index === step ? 'bg-brand-500 text-white' : 'bg-navy-100 text-navy-500'
              )}>
                {index < step ? <FiCheck /> : index + 1}
              </span>
              {label}
              {index === step && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-brand-500" />}
            </li>
          ))}
        </ol>

        {step === 0 && (
          <section aria-labelledby="power-type-heading">
            <h3 id="power-type-heading" className="text-h4 text-navy-900">Select your power type</h3>
            <p className="mt-1 text-sm text-navy-500">Choose how you would like this frame prepared.</p>
            {activeOptions.length ? (
              <div className="mt-5 space-y-3">
                {activeOptions.map((option) => {
                  const active = option.type === selectedPower?.type;
                  return (
                    <button
                      key={option.type}
                      type="button"
                      onClick={() => selectPowerType(option.type)}
                      aria-pressed={active}
                      className={cn(
                        'flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition',
                        active ? 'border-brand-500 bg-brand-50 shadow-soft' : 'border-navy-200 hover:border-brand-300'
                      )}
                    >
                      <span className={cn(
                        'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                        active ? 'bg-brand-500 text-white' : 'bg-surface-muted text-brand-700'
                      )}>
                        <FiEye className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-navy-900">{option.label}</span>
                          {option.badge && <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">{option.badge}</span>}
                        </span>
                        <span className="mt-0.5 block text-sm text-navy-500">
                          {option.subtitle || POWER_COPY[option.type] || 'Custom lens option'}
                        </span>
                      </span>
                      <FiArrowRight className="shrink-0 text-navy-400" />
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="mt-5 rounded-2xl bg-surface-muted p-5 text-sm text-navy-600">No lens power types are available for this product.</p>
            )}
          </section>
        )}

        {step === 1 && (
          <section aria-labelledby="lens-package-heading">
            <h3 id="lens-package-heading" className="text-h4 text-navy-900">Choose your lens package</h3>
            <p className="mt-1 text-sm text-navy-500">Showing packages available for {selectedPower?.label || 'your selection'}.</p>

            {compatiblePackages.length > 0 && (
              <div className="mt-5 flex gap-2 overflow-x-auto pb-1 text-xs font-semibold" role="group" aria-label="Filter lens packages">
                {['all', ...tags].map((tag) => {
                  const active = activeTag === tag;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setActiveTag(tag)}
                      aria-pressed={active}
                      className={cn(
                        'shrink-0 rounded-full border px-3 py-2 transition',
                        active ? 'border-navy-900 bg-navy-900 text-white' : 'border-navy-200 text-navy-600 hover:border-brand-300'
                      )}
                    >
                      {tag === 'all' ? 'All' : tag}
                    </button>
                  );
                })}
              </div>
            )}

            {filteredPackages.length ? (
              <div className="mt-4 space-y-4">
                {filteredPackages.map((item) => {
                  const id = item.id || item._id;
                  const active = id === selectedPackage?.id || id === selectedPackage?._id;
                  const features = Array.isArray(item.features) ? item.features : [];
                  const itemPrice = Number(item.price || 0);
                  const itemMrp = Number(item.mrp ?? item.price ?? 0);
                  const combinedPrice = Number(selectedPower?.price || 0) + itemPrice;
                  const combinedMrp = Number(selectedPower?.price || 0) + itemMrp;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPackageId(id)}
                      aria-pressed={active}
                      className={cn(
                        'group relative grid w-full overflow-hidden rounded-2xl border text-left transition sm:grid-cols-[minmax(130px,0.36fr)_minmax(0,0.64fr)]',
                        active ? 'border-brand-500 bg-brand-50/40 shadow-soft' : 'border-navy-200 bg-surface hover:border-brand-300 hover:shadow-soft'
                      )}
                    >
                      <span className="relative flex min-h-32 items-center justify-center overflow-hidden bg-surface-muted p-4 sm:min-h-44">
                        {item.badge && (
                          <span className="absolute left-0 top-3 bg-brand-600 px-3 py-1 text-xs font-bold text-white">
                            {item.badge}
                          </span>
                        )}
                        {item.image ? (
                          <img src={item.image} alt="" className="h-28 w-full object-contain sm:h-36" />
                        ) : (
                          <FiImage className="h-14 w-14 text-brand-300" aria-hidden="true" />
                        )}
                        {warrantyLabel(item.warrantyMonths) && (
                          <span className="absolute bottom-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[11px] font-semibold text-navy-600 shadow-sm">
                            <FiShield /> {warrantyLabel(item.warrantyMonths)}
                          </span>
                        )}
                      </span>
                      <span className="flex min-w-0 flex-col p-4 sm:p-5">
                        <span className="flex items-start justify-between gap-3">
                          <span className="font-bold text-navy-900">{item.name}</span>
                          <span className={cn(
                            'flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                            active ? 'bg-brand-500 text-white' : 'bg-navy-900 text-white'
                          )}>
                            {active ? <FiCheck className="h-4 w-4" /> : <FiArrowRight className="h-4 w-4" />}
                          </span>
                        </span>
                        {item.description && <span className="mt-1 block text-sm text-navy-500">{item.description}</span>}
                        {features.length > 0 && (
                          <span className="mt-3 block space-y-1.5">
                            {features.map((feature) => (
                              <span key={feature} className="flex items-start gap-2 text-sm text-navy-600">
                                <FiCheck className="mt-0.5 shrink-0 text-success" /> {feature}
                              </span>
                            ))}
                          </span>
                        )}
                        <span className="mt-auto flex items-end justify-between gap-3 border-t border-dashed border-navy-200 pt-3 text-sm">
                          <span className="text-xs text-navy-400">Lens surcharge</span>
                          <span className="text-right">
                            <span className="block font-bold text-brand-700">{combinedPrice ? `Add ${formatPrice(combinedPrice)}` : 'Included'}</span>
                            {combinedMrp > combinedPrice && <span className="text-xs text-navy-400 line-through">{formatPrice(combinedMrp)}</span>}
                          </span>
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : noPackageRequired ? (
              <div className="mt-5 rounded-2xl border border-brand-200 bg-brand-50 p-5 text-brand-800">
                <FiCheck className="mb-2 h-6 w-6" />
                <p className="font-semibold">No lens package needed</p>
                <p className="mt-1 text-sm">This frame will be supplied without lenses.</p>
              </div>
            ) : (
              <p className="mt-5 rounded-2xl bg-surface-muted p-5 text-sm text-navy-600">
                {compatiblePackages.length ? 'No packages match this filter.' : 'No lens packages are available for this power type.'}
              </p>
            )}
          </section>
        )}

        {step === 2 && (
          <section aria-labelledby="eye-power-heading">
            <h3 id="eye-power-heading" className="text-h4 text-navy-900">
              {needsPrescription ? 'How would you like to provide your power?' : 'Your lens selection is ready'}
            </h3>
            {needsPrescription ? (
              <>
                <p className="mt-1 text-sm text-navy-500">Choose a convenient prescription method. You can change this before adding the frame.</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[
                    { method: 'manual', title: 'Enter your eye power', subtitle: 'Choose values from your latest prescription.', icon: FiEye },
                    { method: 'upload', title: 'Upload prescription', subtitle: 'Upload a JPG, PNG, WebP, or PDF up to 2 MB.', icon: FiUpload },
                  ].map(({ method, title, subtitle, icon: Icon }) => (
                    <button
                      key={method}
                      type="button"
                      aria-pressed={prescriptionMethod === method}
                      onClick={() => {
                        setPrescriptionMethod(method);
                        setUploadError('');
                      }}
                      className={cn(
                        'flex items-start gap-3 rounded-2xl border p-4 text-left transition',
                        prescriptionMethod === method
                          ? 'border-brand-600 bg-brand-50 text-brand-900'
                          : 'border-navy-100 bg-white text-navy-800 hover:border-brand-300'
                      )}
                    >
                      <span className={cn('rounded-xl p-2', prescriptionMethod === method ? 'bg-brand-600 text-white' : 'bg-surface-muted text-brand-700')}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block font-semibold">{title}</span>
                        <span className="mt-0.5 block text-sm text-navy-500">{subtitle}</span>
                      </span>
                    </button>
                  ))}
                </div>
                {prescriptionMethod === 'manual' && (
                  <p className="mt-5 text-sm text-navy-500">Required fields are marked with an asterisk.</p>
                )}
                {prescriptionMethod === 'manual' && (applicableFields.length > 0 ? (
                  <div className="mt-5 space-y-5">
                    {applicableFields.map((field) => {
                      const choices = buildPowerChoices(field).map((value) => ({ label: value, value }));
                      if (field.scope === 'per-eye') {
                        return (
                          <fieldset key={field.key} className="rounded-2xl border border-navy-100 bg-surface-muted p-4">
                            <legend className="px-1 text-sm font-semibold text-navy-800">{field.label}{field.required && <span className="ml-0.5 text-error">*</span>}</legend>
                            <div className="grid gap-3 sm:grid-cols-2">
                              {['Right', 'Left'].map((eye) => {
                                const key = fieldSnapshotKey(field, eye);
                                return (
                                  <Select
                                    key={eye}
                                    label={`${eye} eye · ${field.label}`}
                                    options={choices}
                                    placeholder={`Select ${field.label}`}
                                    value={prescriptionValues[key] || ''}
                                    onChange={(event) => updatePrescription(key, event.target.value)}
                                    required={field.required}
                                  />
                                );
                              })}
                            </div>
                          </fieldset>
                        );
                      }

                      const key = fieldSnapshotKey(field);
                      return (
                        <div key={field.key} className="rounded-2xl border border-navy-100 bg-surface-muted p-4 sm:max-w-xs">
                          <Select
                            label={field.label}
                            options={choices}
                            placeholder={`Select ${field.label}`}
                            value={prescriptionValues[key] || ''}
                            onChange={(event) => updatePrescription(key, event.target.value)}
                            required={field.required}
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-5 rounded-2xl bg-surface-muted p-5 text-sm text-navy-600">No prescription fields are configured for this power type.</p>
                ))}
                {prescriptionMethod === 'manual' && !manualPrescriptionComplete && (
                  <p className="mt-4 text-sm font-medium text-navy-600" role="status">Complete all required power values to continue.</p>
                )}
                {prescriptionMethod === 'upload' && (
                  <div className="mt-5 rounded-2xl border border-dashed border-brand-300 bg-brand-50/40 p-5">
                    <div className="flex flex-wrap items-center gap-3">
                      <label className={cn('inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white', uploading && 'cursor-wait opacity-60')}>
                        <FiUpload />
                        {uploading ? 'Reading file…' : uploadedPrescription ? 'Replace prescription' : 'Choose prescription file'}
                        <input
                          type="file"
                          className="sr-only"
                          accept="image/jpeg,image/png,image/webp,application/pdf"
                          aria-label="Upload prescription file"
                          disabled={uploading}
                          onChange={uploadPrescription}
                        />
                      </label>
                      {uploadedPrescription && (
                        <button type="button" className="text-sm font-semibold text-error" onClick={() => setUploadedPrescription(null)}>
                          Remove
                        </button>
                      )}
                    </div>
                    {uploadedPrescription ? (
                      <div className="mt-4 flex items-center gap-3 rounded-xl bg-white p-3 text-sm text-navy-700">
                        <FiFileText className="h-5 w-5 shrink-0 text-brand-700" />
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-navy-900">{uploadedPrescription.fileName}</span>
                          <span className="block text-xs text-navy-500">Ready to attach to this order</span>
                        </span>
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-navy-500" role="status">Upload a prescription to continue.</p>
                    )}
                    {uploadError && <p className="mt-3 text-sm font-medium text-error" role="alert">{uploadError}</p>}
                  </div>
                )}
              </>
            ) : (
              <div className="mt-5 rounded-2xl bg-brand-50 p-5 text-sm text-brand-800">
                <FiCheck className="mb-2 h-6 w-6" />
                No prescription is needed for {selectedPower?.label || 'this choice'}. Your selected lens package is ready to add to the frame.
              </div>
            )}
          </section>
        )}
      </div>
    </Drawer>
  );
}

export default LensSelectionDrawer;
