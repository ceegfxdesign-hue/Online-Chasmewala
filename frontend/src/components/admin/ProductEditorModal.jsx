import { useEffect, useRef, useState } from 'react';
import { Button, Checkbox, Input, Modal, Select, Textarea } from '@/components/ui';
import { useToast } from '@/contexts/ToastContext';
import { getOptimizedImageUrl } from '@/lib/images';

const GENDERS = ['men', 'women', 'unisex', 'kids'];
const FRAME_SHAPES = ['rectangle', 'square', 'round', 'oval', 'cat-eye', 'aviator', 'wayfarer', 'geometric', 'clubmaster'];
const FRAME_TYPES = ['full-rim', 'half-rim', 'rimless'];
const FRAME_MATERIALS = ['acetate', 'metal', 'tr90', 'titanium', 'plastic', 'mixed'];
const FRAME_SIZES = ['narrow', 'medium', 'wide', 'extra-wide'];
const LENS_TYPES = ['single-vision', 'bifocal', 'progressive', 'zero-power', 'blue-light', 'polarized', 'photochromic', 'sunglasses'];
const MAX_UPLOADED_IMAGES = 5;
const MAX_IMAGE_EDGE = 1200;
const MAX_IMAGE_DATA_URL_LENGTH = 750000;
const LENS_IDENTIFIER_PATTERN = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/;
const MAX_LENS_POWER_MODES = 12;
const MAX_LENS_PACKAGES = 30;
const MAX_LENS_PRESCRIPTION_FIELDS = 24;

const DEFAULT_LENS_OPTIONS = [
  {
    type: 'single-vision',
    label: 'With Power',
    subtitle: 'Positive, negative or cylindrical',
    badge: 'Most common',
    requiresPrescription: true,
    isActive: true,
    price: 0,
  },
  {
    type: 'zero-power',
    label: 'Zero Power',
    subtitle: 'No prescription required',
    badge: '',
    requiresPrescription: false,
    isActive: true,
    price: 0,
  },
  {
    type: 'progressive',
    label: 'Progressive/Bifocal',
    subtitle: 'Two powers in one lens',
    badge: '',
    requiresPrescription: true,
    isActive: true,
    price: 1200,
  },
  {
    type: 'frame-only',
    label: 'Frame Only',
    subtitle: 'With no lenses',
    badge: '',
    requiresPrescription: false,
    isActive: true,
    price: 0,
  },
];

const DEFAULT_LENS_PACKAGES = [
  {
    id: 'anti-glare',
    name: 'Anti-Glare Premium',
    description: 'Clear everyday lenses with dependable protection.',
    badge: 'Included',
    image: '',
    features: ['Double-sided anti-glare', 'Scratch resistant'],
    warrantyMonths: 6,
    price: 0,
    mrp: 0,
    tags: ['Bestsellers'],
    powerTypes: ['single-vision', 'zero-power', 'progressive'],
    isActive: true,
  },
  {
    id: 'blu-screen',
    name: 'BLU Screen Protection',
    description: 'Comfortable lenses for phones, laptops and other screens.',
    badge: 'Screen favourite',
    image: '',
    features: ['Blue-light filtering', 'Reduces eye strain'],
    warrantyMonths: 12,
    price: 250,
    mrp: 500,
    tags: ['Bestsellers', 'Work friendly'],
    powerTypes: ['single-vision', 'zero-power', 'progressive'],
    isActive: true,
  },
  {
    id: 'photochromic',
    name: 'Photochromic Comfort',
    description: 'Adaptive lenses for changing indoor and outdoor light.',
    badge: 'Outdoor ready',
    image: '',
    features: ['Darkens in sunlight', 'UV protection'],
    warrantyMonths: 12,
    price: 1000,
    mrp: 1500,
    tags: ['High power'],
    powerTypes: ['single-vision', 'zero-power', 'progressive'],
    isActive: true,
  },
];

const DEFAULT_LENS_PRESCRIPTION_FIELDS = [
  { key: 'sph', label: 'SPH', min: -20, max: 20, step: 0.25, scope: 'per-eye', required: true, powerTypes: ['single-vision', 'progressive'], isActive: true },
  { key: 'cyl', label: 'CYL', min: -6, max: 0, step: 0.25, scope: 'per-eye', required: false, powerTypes: ['single-vision', 'progressive'], isActive: true },
  { key: 'axis', label: 'Axis', min: 0, max: 180, step: 1, scope: 'per-eye', required: false, powerTypes: ['single-vision', 'progressive'], isActive: true },
  { key: 'pd', label: 'PD', min: 45, max: 80, step: 1, scope: 'shared', required: true, powerTypes: ['single-vision', 'progressive'], isActive: true },
  { key: 'add', label: 'ADD', min: 0.5, max: 4, step: 0.25, scope: 'per-eye', required: true, powerTypes: ['progressive'], isActive: true },
];

const EMPTY_CONTACT_LENS = {
  kind: 'clear',
  wearSchedule: '',
  lensesPerBox: '',
  powerModes: ['with-power'],
  powerTypes: [{ name: 'Spherical', min: -3, max: 3, step: 0.25 }],
  packOptions: [],
  availableColors: [],
};

const asLines = (items = []) => items.join('\n');
const asCommaList = (items = []) => items.join(', ');
const humanize = (value) => value.replaceAll('-', ' ');
const createContactPack = () => ({ label: '', units: 1, price: 0, mrp: 0 });
const createContactColor = () => ({ name: '', hex: '#6B7280', images: [] });
const createContactPowerType = () => ({ name: '', min: -3, max: 3, step: 0.25 });
const toStringArray = (value) => {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (typeof value === 'string') return value.split(',').map((item) => item.trim()).filter(Boolean);
  return [];
};
const isBlankNumeric = (value) => value == null || (typeof value === 'string' && value.trim() === '');
const stableSlug = (value, fallback) => String(value || fallback)
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '') || fallback;
const createUniqueIdentifier = (prefix, items, property) => {
  const used = new Set(items.map((item) => String(item[property] || '').toLowerCase()));
  let suffix = items.length + 1;
  let identifier = `${prefix}-${suffix}`;
  while (used.has(identifier)) {
    suffix += 1;
    identifier = `${prefix}-${suffix}`;
  }
  return identifier;
};
const normalizeLensOptions = (items = []) => items.map((item, index) => {
  const type = stableSlug(item?.type || item?.label, `power-mode-${index + 1}`);
  return {
    ...(item || {}),
    type,
    label: String(item?.label || humanize(type)).trim(),
    subtitle: String(item?.subtitle || ''),
    badge: String(item?.badge || ''),
    requiresPrescription: typeof item?.requiresPrescription === 'boolean'
      ? item.requiresPrescription
      : !['zero-power', 'frame-only'].includes(type),
    isActive: item?.isActive !== false,
    price: item?.price ?? 0,
  };
});
const normalizeLensPackages = (items = []) => items.map((item, index) => ({
  ...(item || {}),
  id: stableSlug(item?.id || item?.name, `lens-package-${index + 1}`),
  name: String(item?.name || ''),
  description: String(item?.description || ''),
  badge: String(item?.badge || ''),
  image: String(item?.image || ''),
  features: toStringArray(item?.features),
  warrantyMonths: item?.warrantyMonths ?? '',
  price: item?.price ?? 0,
  mrp: item?.mrp ?? item?.price ?? 0,
  tags: toStringArray(item?.tags),
  powerTypes: toStringArray(item?.powerTypes).length ? toStringArray(item.powerTypes) : ['all'],
  isActive: item?.isActive !== false,
}));
const normalizeLensPrescriptionFields = (items = []) => items.map((item, index) => ({
  ...(item || {}),
  key: stableSlug(item?.key || item?.label, `prescription-field-${index + 1}`),
  label: String(item?.label || ''),
  min: item?.min ?? '',
  max: item?.max ?? '',
  step: item?.step ?? '',
  scope: item?.scope === 'shared' ? 'shared' : 'per-eye',
  required: item?.required !== false,
  powerTypes: toStringArray(item?.powerTypes).length ? toStringArray(item.powerTypes) : ['all'],
  isActive: item?.isActive !== false,
}));
const createLensOption = (items) => ({
  type: createUniqueIdentifier('power-mode', items, 'type'),
  label: '',
  subtitle: '',
  badge: '',
  requiresPrescription: true,
  isActive: true,
  price: 0,
});
const createLensPackage = (items) => ({
  id: createUniqueIdentifier('lens-package', items, 'id'),
  name: '',
  description: '',
  badge: '',
  image: '',
  features: [],
  warrantyMonths: '',
  price: 0,
  mrp: 0,
  tags: [],
  powerTypes: ['all'],
  isActive: true,
});
const createLensPrescriptionField = (items) => ({
  key: createUniqueIdentifier('prescription-field', items, 'key'),
  label: '',
  min: -10,
  max: 10,
  step: 0.25,
  scope: 'per-eye',
  required: true,
  powerTypes: ['all'],
  isActive: true,
});
const normalizeContactLens = (value) => {
  const legacyFields = value?.prescriptionFields?.length ? value.prescriptionFields : ['Spherical'];
  const powerTypes = value?.powerTypes?.length
    ? value.powerTypes.map((powerType) => ({ step: 0.25, ...powerType }))
    : legacyFields.map((name) => ({
      name,
      min: value?.sphericalPowerMin ?? -3,
      max: value?.sphericalPowerMax ?? 3,
      step: 0.25,
    }));

  return {
    ...EMPTY_CONTACT_LENS,
    ...(value || {}),
    powerModes: value?.powerModes?.length ? value.powerModes : EMPTY_CONTACT_LENS.powerModes,
    powerTypes,
    packOptions: value?.packOptions || EMPTY_CONTACT_LENS.packOptions,
    availableColors: value?.availableColors || [],
  };
};

const createEmptyVariant = () => ({
  color: '',
  primaryColor: '',
  primaryColorHex: '#4B5563',
  secondaryColor: '',
  secondaryColorHex: '#C4C7CC',
  stock: 0,
  sku: '',
  images: [],
});

function normalizeImageSource(value) {
  const source = value.trim();
  const driveFile = source.match(/^https?:\/\/drive\.google\.com\/file\/d\/([^/?#]+)/i);
  return driveFile ? `https://drive.google.com/uc?export=view&id=${driveFile[1]}` : source;
}

function createCompressedImageUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file?.type?.startsWith('image/')) {
      reject(new Error('Please choose an image file.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('The selected image could not be read.'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('The selected image could not be opened.'));
      image.onload = () => {
        const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('Image preparation is not supported in this browser.'));
          return;
        }
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        let quality = 0.86;
        let imageUrl = canvas.toDataURL('image/jpeg', quality);
        while (imageUrl.length > MAX_IMAGE_DATA_URL_LENGTH && quality > 0.45) {
          quality -= 0.1;
          imageUrl = canvas.toDataURL('image/jpeg', quality);
        }
        if (imageUrl.length > MAX_IMAGE_DATA_URL_LENGTH) {
          reject(new Error('This image is too large. Please choose a smaller image.'));
          return;
        }
        resolve(imageUrl);
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function Toggle({ name, label, defaultChecked = false }) {
  return (
    <label className="flex items-center gap-2 rounded-lg border border-navy-100 px-3 py-2 text-sm text-navy-700">
      <input name={name} type="checkbox" defaultChecked={defaultChecked} className="accent-brand-500" />
      {label}
    </label>
  );
}

function LensApplicabilitySelector({ label, selected = [], powerModes, onChange }) {
  const appliesToAll = selected.includes('all');
  const toggleAll = (checked) => onChange(checked ? ['all'] : []);
  const toggleMode = (type, checked) => {
    const specificModes = selected.filter((value) => value !== 'all');
    onChange(checked
      ? [...new Set([...specificModes, type])]
      : specificModes.filter((value) => value !== type));
  };

  return (
    <fieldset className="rounded-xl border border-navy-100 bg-surface p-3">
      <legend className="px-1 text-sm font-medium text-navy-700">{label}</legend>
      <p className="mb-2 text-xs text-navy-400">Choose All or any combination of configured power modes.</p>
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        <Checkbox
          label="All power modes"
          checked={appliesToAll}
          onChange={(event) => toggleAll(event.target.checked)}
        />
        {powerModes.map((mode) => (
          <Checkbox
            key={mode.type}
            label={mode.label || humanize(mode.type)}
            checked={!appliesToAll && selected.includes(mode.type)}
            onChange={(event) => toggleMode(mode.type, event.target.checked)}
          />
        ))}
      </div>
    </fieldset>
  );
}

function prepareEyeglassLensConfiguration(lensOptions, lensPackages, lensPrescriptionFields) {
  const hasLensConfiguration = lensOptions.length > 0 || lensPackages.length > 0 || lensPrescriptionFields.length > 0;
  const hasBlankModePrice = lensOptions.some((option) => isBlankNumeric(option.price));
  const options = lensOptions.map((option) => ({
    ...option,
    type: String(option.type || '').trim(),
    label: String(option.label || '').trim(),
    subtitle: String(option.subtitle || '').trim() || undefined,
    badge: String(option.badge || '').trim() || undefined,
    requiresPrescription: option.requiresPrescription === true,
    isActive: option.isActive !== false,
    price: Number(option.price),
  }));
  if (options.length > MAX_LENS_POWER_MODES) {
    return { field: 'lensOptions', message: `Add no more than ${MAX_LENS_POWER_MODES} power modes.` };
  }
  if (options.some((option) => !option.type || !option.label || !LENS_IDENTIFIER_PATTERN.test(option.type) || option.type.length > 60)) {
    return { field: 'lensOptions', message: 'Every power mode needs a name and a lowercase ID using letters, numbers, hyphens, or underscores.' };
  }
  if (options.some((option) => option.label.length > 80 || (option.subtitle?.length || 0) > 160 || (option.badge?.length || 0) > 40)) {
    return { field: 'lensOptions', message: 'Keep power-mode names within 80 characters, supporting text within 160, and badges within 40.' };
  }
  if (hasBlankModePrice || options.some((option) => !Number.isFinite(option.price) || option.price < 0)) {
    return { field: 'lensOptions', message: 'Enter a price of zero or greater for every power mode; prices cannot be blank.' };
  }
  const optionTypes = options.map((option) => option.type.toLowerCase());
  const optionLabels = options.map((option) => option.label.toLowerCase());
  if (new Set(optionTypes).size !== optionTypes.length || new Set(optionLabels).size !== optionLabels.length) {
    return { field: 'lensOptions', message: 'Give every power mode a unique ID and name.' };
  }
  const activeOptions = options.filter((option) => option.isActive !== false);
  if (hasLensConfiguration && !activeOptions.length) {
    return { field: 'lensOptions', message: 'Keep at least one power mode active so customers can configure lenses.' };
  }

  const configuredTypes = new Set(options.map((option) => option.type));
  const validateApplicability = (powerTypes, itemName) => {
    if (!powerTypes.length) return `${itemName} must be shown for All or at least one power mode.`;
    if (powerTypes.length > MAX_LENS_POWER_MODES) return `${itemName} can use no more than ${MAX_LENS_POWER_MODES} power modes.`;
    if (powerTypes.includes('all') && powerTypes.length > 1) return `${itemName} cannot combine All with specific power modes.`;
    const unknownType = powerTypes.find((type) => type !== 'all' && !configuredTypes.has(type));
    return unknownType ? `${itemName} uses an unknown power mode (${unknownType}).` : null;
  };

  const hasBlankPackagePrice = lensPackages.some((lensPackage) => (
    isBlankNumeric(lensPackage.price) || isBlankNumeric(lensPackage.mrp)
  ));
  const packages = lensPackages.map((lensPackage) => ({
    ...lensPackage,
    id: String(lensPackage.id || '').trim(),
    name: String(lensPackage.name || '').trim(),
    description: String(lensPackage.description || '').trim() || undefined,
    badge: String(lensPackage.badge || '').trim() || undefined,
    image: String(lensPackage.image || '').trim() || undefined,
    features: toStringArray(lensPackage.features),
    warrantyMonths: lensPackage.warrantyMonths === '' || lensPackage.warrantyMonths == null
      ? undefined
      : Number(lensPackage.warrantyMonths),
    price: Number(lensPackage.price),
    mrp: Number(lensPackage.mrp),
    tags: toStringArray(lensPackage.tags),
    powerTypes: [...new Set(toStringArray(lensPackage.powerTypes))],
    isActive: lensPackage.isActive !== false,
  }));
  if (packages.length > MAX_LENS_PACKAGES) {
    return { field: 'lensPackages', message: `Add no more than ${MAX_LENS_PACKAGES} lens packages.` };
  }
  if (packages.some((lensPackage) => !lensPackage.id || !lensPackage.name || !LENS_IDENTIFIER_PATTERN.test(lensPackage.id) || lensPackage.id.length > 60)) {
    return { field: 'lensPackages', message: 'Every lens package needs a name and a lowercase stable ID using letters, numbers, hyphens, or underscores.' };
  }
  const packageCopyTooLong = packages.some((lensPackage) => (
    lensPackage.name.length > 100
    || (lensPackage.description?.length || 0) > 300
    || (lensPackage.badge?.length || 0) > 40
    || (lensPackage.image?.length || 0) > 2000
    || lensPackage.features.length > 12
    || lensPackage.features.some((feature) => feature.length > 120)
    || lensPackage.tags.length > 16
    || lensPackage.tags.some((tag) => tag.length > 50)
  ));
  if (packageCopyTooLong) {
    return { field: 'lensPackages', message: 'Shorten the package copy: name 100, description 300, badge 40, feature 120, and tag 50 characters maximum.' };
  }
  const packageIds = packages.map((lensPackage) => lensPackage.id.toLowerCase());
  const packageNames = packages.map((lensPackage) => lensPackage.name.toLowerCase());
  if (new Set(packageIds).size !== packageIds.length || new Set(packageNames).size !== packageNames.length) {
    return { field: 'lensPackages', message: 'Give every lens package a unique ID and name.' };
  }
  const invalidPackage = packages.find((lensPackage) => (
    hasBlankPackagePrice
    || !Number.isFinite(lensPackage.price)
    || !Number.isFinite(lensPackage.mrp)
    || lensPackage.price < 0
    || lensPackage.mrp < lensPackage.price
    || (lensPackage.warrantyMonths !== undefined && (!Number.isInteger(lensPackage.warrantyMonths) || lensPackage.warrantyMonths < 0 || lensPackage.warrantyMonths > 120))
  ));
  if (invalidPackage) {
    return { field: 'lensPackages', message: 'Enter non-blank package prices, keep MRP at or above price, and use a warranty from 0 to 120 whole months.' };
  }
  for (const lensPackage of packages) {
    const applicabilityError = validateApplicability(lensPackage.powerTypes, `Lens package “${lensPackage.name}”`);
    if (applicabilityError) return { field: 'lensPackages', message: applicabilityError };
  }

  const hasBlankPrescriptionLimit = lensPrescriptionFields.some((field) => (
    isBlankNumeric(field.min) || isBlankNumeric(field.max) || isBlankNumeric(field.step)
  ));
  const prescriptionFields = lensPrescriptionFields.map((prescriptionField) => ({
    ...prescriptionField,
    key: String(prescriptionField.key || '').trim(),
    label: String(prescriptionField.label || '').trim(),
    min: Number(prescriptionField.min),
    max: Number(prescriptionField.max),
    step: Number(prescriptionField.step),
    scope: prescriptionField.scope === 'shared' ? 'shared' : 'per-eye',
    required: prescriptionField.required !== false,
    powerTypes: [...new Set(toStringArray(prescriptionField.powerTypes))],
    isActive: prescriptionField.isActive !== false,
  }));
  if (prescriptionFields.length > MAX_LENS_PRESCRIPTION_FIELDS) {
    return { field: 'lensPrescriptionFields', message: `Add no more than ${MAX_LENS_PRESCRIPTION_FIELDS} prescription fields.` };
  }
  if (prescriptionFields.some((field) => !field.key || !field.label || !LENS_IDENTIFIER_PATTERN.test(field.key) || field.key.length > 60)) {
    return { field: 'lensPrescriptionFields', message: 'Every prescription field needs a label and a lowercase key using letters, numbers, hyphens, or underscores.' };
  }
  if (prescriptionFields.some((field) => field.label.length > 80)) {
    return { field: 'lensPrescriptionFields', message: 'Keep prescription field labels within 80 characters.' };
  }
  const fieldKeys = prescriptionFields.map((field) => field.key.toLowerCase());
  const fieldLabels = prescriptionFields.map((field) => field.label.toLowerCase());
  if (new Set(fieldKeys).size !== fieldKeys.length || new Set(fieldLabels).size !== fieldLabels.length) {
    return { field: 'lensPrescriptionFields', message: 'Give every prescription field a unique key and label.' };
  }
  const invalidPrescriptionField = prescriptionFields.find((field) => (
    hasBlankPrescriptionLimit
    || !Number.isFinite(field.min)
    || !Number.isFinite(field.max)
    || !Number.isFinite(field.step)
    || field.min < -200
    || field.max > 200
    || field.min > field.max
    || field.step < 0.001
    || field.step > 400
    || ((field.max - field.min) / field.step) + 1 > 1000
  ));
  if (invalidPrescriptionField) {
    return { field: 'lensPrescriptionFields', message: 'Enter non-blank limits from -200 to 200, with an increment from 0.001 to 400 and no more than 1,000 choices.' };
  }
  for (const prescriptionField of prescriptionFields) {
    const applicabilityError = validateApplicability(prescriptionField.powerTypes, `Prescription field “${prescriptionField.label}”`);
    if (applicabilityError) return { field: 'lensPrescriptionFields', message: applicabilityError };
  }

  const appliesToMode = (item, modeType) => item.powerTypes.includes('all') || item.powerTypes.includes(modeType);
  const modeWithoutPackage = activeOptions.find((option) => (
    option.type !== 'frame-only'
    && !packages.some((lensPackage) => lensPackage.isActive !== false && appliesToMode(lensPackage, option.type))
  ));
  if (modeWithoutPackage) {
    return { field: 'lensPackages', message: `Add an active lens package shown for ${modeWithoutPackage.label}, or deactivate that power mode.` };
  }
  const modeWithoutPrescriptionField = activeOptions.find((option) => (
    option.requiresPrescription
    && !prescriptionFields.some((field) => (
      field.isActive !== false
      && field.required !== false
      && appliesToMode(field, option.type)
    ))
  ));
  if (modeWithoutPrescriptionField) {
    return { field: 'lensPrescriptionFields', message: `Add an active required prescription field used for ${modeWithoutPrescriptionField.label}, or turn off its prescription requirement.` };
  }

  return { value: { lensOptions: options, lensPackages: packages, lensPrescriptionFields: prescriptionFields } };
}

/**
 * Complete product editor for the admin area. Array fields use one item per
 * line (or comma-separated chips) so the request matches the product API.
 */
export function ProductEditorModal({ product, categories, brands, onClose, onSave, saving = false, contactLensMode = false, fixedCategoryId }) {
  const toast = useToast();
  const editing = Boolean(product?._id);
  const productOpen = Boolean(product);
  const [validationErrors, setValidationErrors] = useState({});
  const [mainImageUrls, setMainImageUrls] = useState('');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [preparingImages, setPreparingImages] = useState(false);
  const [variants, setVariants] = useState([]);
  const [contactLens, setContactLens] = useState(EMPTY_CONTACT_LENS);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [lensOptions, setLensOptions] = useState([]);
  const [lensPackages, setLensPackages] = useState([]);
  const [lensPrescriptionFields, setLensPrescriptionFields] = useState([]);
  const mainImageInputRef = useRef(null);
  const mainImageUploadModeRef = useRef('add');
  const variantImageInputRefs = useRef({});
  const variantImageUploadModesRef = useRef({});
  const lensDefaultsInitializedRef = useRef(false);
  const lensConfigurationRef = useRef(null);

  const getFieldError = (field) => validationErrors[field];
  const selectedCategoryDetails = categories.find((item) => String(item._id) === String(selectedCategory))
    || (product?.category && typeof product.category === 'object' ? product.category : null);
  const categorySlug = String(selectedCategoryDetails?.slug || selectedCategoryDetails?.name || '').toLowerCase();
  const hasSavedEyeglassLensConfiguration = Boolean(
    product?.lensOptions?.length || product?.lensPackages?.length || product?.lensPrescriptionFields?.length
  );
  const showEyeglassLensConfiguration = !contactLensMode && (
    categorySlug.includes('eyeglass')
    || hasSavedEyeglassLensConfiguration
  );

  const scrollToLensConfiguration = () => {
    lensConfigurationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    if (!product?._focusLensConfiguration || !showEyeglassLensConfiguration) return undefined;
    const frame = window.requestAnimationFrame(() => {
      lensConfigurationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [product?._focusLensConfiguration, showEyeglassLensConfiguration]);

  useEffect(() => {
    const initialCategoryId = product?.category?._id || product?.category || '';
    const initialCategory = categories.find((item) => String(item._id) === String(initialCategoryId))
      || (product?.category && typeof product.category === 'object' ? product.category : null);
    const initialCategorySlug = String(initialCategory?.slug || initialCategory?.name || '').toLowerCase();
    const shouldInitializeLensDefaults = !contactLensMode && (
      initialCategorySlug.includes('eyeglass')
      || Boolean(product?.lensOptions?.length || product?.lensPackages?.length || product?.lensPrescriptionFields?.length)
    );
    setMainImageUrls(asLines(product?.images));
    setUploadedImages([]);
    setPreparingImages(false);
    setVariants(product?.variants?.map((variant) => ({ ...createEmptyVariant(), ...variant, images: variant.images || [] })) || []);
    setContactLens(normalizeContactLens(product?.contactLens));
    setSelectedCategory(initialCategoryId);
    setLensOptions(product?.lensOptions?.length
      ? normalizeLensOptions(product.lensOptions)
      : shouldInitializeLensDefaults ? DEFAULT_LENS_OPTIONS.map((option) => ({ ...option })) : []);
    setLensPackages(product?.lensPackages?.length
      ? normalizeLensPackages(product.lensPackages)
      : shouldInitializeLensDefaults ? DEFAULT_LENS_PACKAGES.map((lensPackage) => ({ ...lensPackage, features: [...lensPackage.features], tags: [...lensPackage.tags], powerTypes: [...lensPackage.powerTypes] })) : []);
    setLensPrescriptionFields(product?.lensPrescriptionFields?.length
      ? normalizeLensPrescriptionFields(product.lensPrescriptionFields)
      : shouldInitializeLensDefaults ? DEFAULT_LENS_PRESCRIPTION_FIELDS.map((field) => ({ ...field, powerTypes: [...field.powerTypes] })) : []);
    lensDefaultsInitializedRef.current = shouldInitializeLensDefaults;
    // Reset only when opening a different product; edits must not reset the form.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?._id, productOpen]);

  useEffect(() => {
    if (showEyeglassLensConfiguration && !lensDefaultsInitializedRef.current) {
      if (!lensOptions.length) setLensOptions(DEFAULT_LENS_OPTIONS.map((option) => ({ ...option })));
      if (!lensPackages.length) setLensPackages(DEFAULT_LENS_PACKAGES.map((lensPackage) => ({ ...lensPackage, features: [...lensPackage.features], tags: [...lensPackage.tags], powerTypes: [...lensPackage.powerTypes] })));
      if (!lensPrescriptionFields.length) setLensPrescriptionFields(DEFAULT_LENS_PRESCRIPTION_FIELDS.map((field) => ({ ...field, powerTypes: [...field.powerTypes] })));
      lensDefaultsInitializedRef.current = true;
    }
  }, [lensOptions.length, lensPackages.length, lensPrescriptionFields.length, showEyeglassLensConfiguration]);

  const savedMainImages = String(mainImageUrls || '')
    .split('\n')
    .map(normalizeImageSource)
    .filter(Boolean);
  const mainImages = [...savedMainImages, ...uploadedImages];

  const chooseMainImages = (mode) => {
    mainImageUploadModeRef.current = mode;
    mainImageInputRef.current?.click();
  };

  const uploadImages = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;
    const replacing = mainImageUploadModeRef.current === 'replace';
    const availableSlots = replacing ? MAX_UPLOADED_IMAGES : MAX_UPLOADED_IMAGES - mainImages.length;
    if (files.length > availableSlots) {
      toast.error(`Select no more than ${Math.max(0, availableSlots)} image(s).`);
      return;
    }

    setPreparingImages(true);
    try {
      const preparedImages = await Promise.all(files.map(createCompressedImageUrl));
      if (replacing) {
        setMainImageUrls('');
        setUploadedImages(preparedImages);
      } else {
        setUploadedImages((current) => [...current, ...preparedImages]);
      }
      toast.success(
        `${preparedImages.length} image${preparedImages.length === 1 ? '' : 's'} ${replacing ? 'will replace the gallery' : 'added'} when you save.`
      );
    } catch (error) {
      toast.error(error.message || 'Unable to prepare these images.');
    } finally {
      setPreparingImages(false);
    }
  };

  const removeMainImage = (index) => {
    if (index < savedMainImages.length) {
      setMainImageUrls(asLines(savedMainImages.filter((_, imageIndex) => imageIndex !== index)));
      return;
    }
    const uploadIndex = index - savedMainImages.length;
    setUploadedImages((current) => current.filter((_, imageIndex) => imageIndex !== uploadIndex));
  };

  const updateVariant = (index, field, value) => {
    setVariants((current) => current.map((variant, itemIndex) => (
      itemIndex === index ? { ...variant, [field]: value } : variant
    )));
  };

  const updateContactLens = (field, value) => setContactLens((current) => ({ ...current, [field]: value }));
  const updateLensOption = (index, field, value) => {
    const previousType = lensOptions[index]?.type;
    setLensOptions((current) => current.map((option, optionIndex) => (
      optionIndex === index ? { ...option, [field]: value } : option
    )));
    if (field === 'type' && previousType && previousType !== value) {
      const replacePowerType = (powerTypes = []) => powerTypes.map((type) => (type === previousType ? value : type));
      setLensPackages((current) => current.map((lensPackage) => ({
        ...lensPackage,
        powerTypes: replacePowerType(lensPackage.powerTypes),
      })));
      setLensPrescriptionFields((current) => current.map((prescriptionField) => ({
        ...prescriptionField,
        powerTypes: replacePowerType(prescriptionField.powerTypes),
      })));
    }
  };
  const removeLensOption = (index) => {
    const removedType = lensOptions[index]?.type;
    setLensOptions((current) => current.filter((_, optionIndex) => optionIndex !== index));
    if (!removedType) return;
    const removePowerType = (powerTypes = []) => powerTypes.filter((type) => type !== removedType);
    setLensPackages((current) => current.map((lensPackage) => ({
      ...lensPackage,
      powerTypes: removePowerType(lensPackage.powerTypes),
    })));
    setLensPrescriptionFields((current) => current.map((prescriptionField) => ({
      ...prescriptionField,
      powerTypes: removePowerType(prescriptionField.powerTypes),
    })));
  };
  const updateLensPackage = (index, field, value) => setLensPackages((current) => current.map((lensPackage, packageIndex) => (
    packageIndex === index ? { ...lensPackage, [field]: value } : lensPackage
  )));
  const updateLensPrescriptionField = (index, field, value) => setLensPrescriptionFields((current) => current.map((prescriptionField, fieldIndex) => (
    fieldIndex === index ? { ...prescriptionField, [field]: value } : prescriptionField
  )));

  const uploadVariantImages = async (index, event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;
    const replacing = variantImageUploadModesRef.current[index] === 'replace';
    const imageCount = replacing ? 0 : variants[index]?.images?.length || 0;
    if (imageCount + files.length > MAX_UPLOADED_IMAGES) {
      toast.error(`Each colour can have up to ${MAX_UPLOADED_IMAGES} images.`);
      return;
    }

    setPreparingImages(true);
    try {
      const preparedImages = await Promise.all(files.map(createCompressedImageUrl));
      setVariants((current) => current.map((variant, itemIndex) => (
        itemIndex === index
          ? { ...variant, images: replacing ? preparedImages : [...(variant.images || []), ...preparedImages] }
          : variant
      )));
      toast.success(
        `${preparedImages.length} colour image${preparedImages.length === 1 ? '' : 's'} ${replacing ? 'will replace the colour gallery' : 'added'} when you save.`
      );
    } catch (error) {
      toast.error(error.message || 'Unable to prepare these images.');
    } finally {
      setPreparingImages(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setValidationErrors({});
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form);

    ['price', 'mrp', 'stock', 'lowStockThreshold', 'rating', 'numReviews', 'soldCount', 'frameWidth', 'lensWidth', 'bridgeSize', 'templeSize', 'warrantyMonths', 'returnDays'].forEach((key) => {
      if (body[key] === '') delete body[key];
      else body[key] = Number(body[key]);
    });

    body.images = mainImages;
    if (!body.images.length) {
      setValidationErrors({ images: 'Add at least one image URL or upload an image file.' });
      toast.error('Add at least one image URL or upload an image file.');
      return;
    }
    body.highlights = String(body.highlights || '').split('\n').map((value) => value.trim()).filter(Boolean);
    ['tags', 'collections', 'suitableFaceShapes'].forEach((key) => {
      body[key] = String(body[key] || '').split(',').map((value) => value.trim()).filter(Boolean);
    });

    const selectedGenders = form.getAll('genders').filter(Boolean);
    if (!selectedGenders.length) {
      setValidationErrors({ genders: 'Select at least one customer group.' });
      toast.error('Select at least one customer group.');
      return;
    }
    body.genders = selectedGenders;
    // Keep the original field populated for existing catalogue views and
    // integrations that still read a single primary gender.
    body.gender = selectedGenders[0];

    const productVariants = variants.map((variant) => ({
      color: String(variant.color || [variant.primaryColor, variant.secondaryColor].filter(Boolean).join(' / ')).trim(),
      colorHex: variant.primaryColorHex || undefined,
      primaryColor: String(variant.primaryColor || '').trim() || undefined,
      primaryColorHex: variant.primaryColorHex || undefined,
      secondaryColor: String(variant.secondaryColor || '').trim() || undefined,
      secondaryColorHex: variant.secondaryColorHex || undefined,
      stock: Number(variant.stock || 0),
      sku: String(variant.sku || '').trim() || undefined,
      images: (variant.images || []).map(normalizeImageSource).filter(Boolean),
    }));
    if (productVariants.some((variant) => !variant.color)) {
      setValidationErrors({ variants: 'Give every colour a label, or enter its primary colour name.' });
      toast.error('Give every colour a label, or enter its primary colour name.');
      return;
    }
    body.variants = productVariants;

    if (contactLensMode) {
      delete body.lensOptions;
      delete body.lensPackages;
      delete body.lensPrescriptionFields;
    } else {
      const lensConfiguration = prepareEyeglassLensConfiguration(lensOptions, lensPackages, lensPrescriptionFields);
      if (!lensConfiguration.value) {
        setValidationErrors({ [lensConfiguration.field]: lensConfiguration.message });
        toast.error(lensConfiguration.message);
        return;
      }
      Object.assign(body, lensConfiguration.value);
    }

    const offerTitle = String(body.offerTitle || '').trim();
    body.promotion = offerTitle
      ? {
        heading: String(body.offerHeading || '').trim() || undefined,
        title: offerTitle,
        subtitle: String(body.offerSubtitle || '').trim() || undefined,
      }
      : null;
    delete body.offerHeading;
    delete body.offerTitle;
    delete body.offerSubtitle;

    if (contactLensMode) {
      body.category = fixedCategoryId || body.category;
      const missingPowerLimit = contactLens.powerTypes.some((item) => item.min === '' || item.max === '' || item.step === '');
      const powerTypes = contactLens.powerTypes.map((item) => ({
        name: String(item.name || '').trim(),
        min: Number(item.min),
        max: Number(item.max),
        step: Number(item.step),
      }));
      const invalidPowerType = powerTypes.find(({ name, min, max, step }) => (
        !name
        || !Number.isFinite(min)
        || !Number.isFinite(max)
        || !Number.isFinite(step)
        || min < -200
        || max > 200
        || min > max
        || step < 0.01
        || ((max - min) / step) + 1 > 1000
      ));
      const duplicatePowerType = new Set(powerTypes.map((item) => item.name.toLowerCase())).size !== powerTypes.length;
      if (!powerTypes.length || powerTypes.length > 12 || missingPowerLimit || invalidPowerType || duplicatePowerType) {
        const message = duplicatePowerType
          ? 'Give every power type a unique name.'
          : 'Add valid power types with a minimum, maximum, and increment. Each range can contain up to 1,000 choices.';
        setValidationErrors({ 'contactLens.powerTypes': message });
        toast.error(message);
        return;
      }
      const packOptions = contactLens.packOptions
        .map((item) => ({
          label: String(item.label || '').trim(),
          units: Number(item.units || 1),
          price: Number(item.price || 0),
          mrp: Number(item.mrp || 0),
        }))
        .filter((item) => item.label);
      body.contactLens = {
        kind: contactLens.kind,
        wearSchedule: String(contactLens.wearSchedule || '').trim() || undefined,
        lensesPerBox: contactLens.lensesPerBox === '' || contactLens.lensesPerBox == null
          ? undefined
          : Number(contactLens.lensesPerBox),
        powerModes: contactLens.kind === 'clear' || contactLens.kind === 'color'
          ? contactLens.powerModes.filter(Boolean)
          : ['zero-power'],
        powerTypes,
        // Keep field names for compatibility with older storefront builds.
        prescriptionFields: powerTypes.map((item) => item.name),
        packOptions,
        availableColors: contactLens.kind === 'color'
          ? contactLens.availableColors
            .map((color) => ({
              name: String(color.name || '').trim(),
              hex: String(color.hex || '').trim() || undefined,
              images: (color.images || []).map(normalizeImageSource).filter(Boolean),
            }))
            .filter((color) => color.name)
          : [],
      };
    } else {
      delete body.contactLens;
    }

    ['powered', 'blueLightFilter', 'polarized', 'uvProtection', 'isActive', 'isBestSeller', 'isTrending', 'isNewArrival', 'isFeatured'].forEach((key) => {
      body[key] = form.get(key) === 'on';
    });

    ['frameShape', 'frameType', 'frameMaterial', 'frameSize', 'rimType', 'lensType', 'lensThickness', 'frameColor'].forEach((key) => {
      if (!body[key]) delete body[key];
    });

    try {
      await onSave(body);
      toast.success('Product saved');
      onClose();
    } catch (error) {
      const errors = Array.isArray(error?.errors) ? error.errors : [];
      const byField = errors.reduce((result, item) => {
        if (item?.field && item?.message) result[item.field] = item.message;
        return result;
      }, {});
      setValidationErrors(byField);
      const firstError = errors[0];
      toast.error(firstError ? `${firstError.field}: ${firstError.message}` : error?.message || 'Unable to save product');
    }
  };

  return (
    <Modal open={Boolean(product)} onClose={onClose} title={`${editing ? 'Edit' : 'Add'} product`} size="xl">
      <form onSubmit={submit} className="space-y-7">
        {Object.keys(validationErrors).length > 0 && (
          <div className="rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error" role="alert">
            Please correct the highlighted field{Object.keys(validationErrors).length === 1 ? '' : 's'} and save again.
          </div>
        )}
        <section>
          <h3 className="mb-3 font-semibold text-navy-900">Core details</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Input name="name" label="Product name" defaultValue={product?.name} minLength="2" error={getFieldError('name')} required />
            <Input name="sku" label="SKU" defaultValue={product?.sku} error={getFieldError('sku')} required />
            {contactLensMode ? (
              <div>
                <input name="category" type="hidden" value={fixedCategoryId || product?.category?._id || product?.category || ''} readOnly />
                <p className="mb-1.5 text-sm font-medium text-navy-700">Category</p>
                <div className="flex h-11 items-center rounded-xl border border-brand-200 bg-brand-50 px-3 text-sm font-semibold text-brand-700">Contact lenses</div>
              </div>
            ) : (
              <Select name="category" label="Category" value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)} placeholder="Select a category" options={categories.map((item) => ({ value: item._id, label: item.name }))} error={getFieldError('category')} required />
            )}
            <Select name="brand" label="Brand" defaultValue={product?.brand?._id || product?.brand || ''} placeholder="Select a brand" options={brands.map((item) => ({ value: item._id, label: item.name }))} error={getFieldError('brand')} required />
            <Input name="price" label="Selling price (₹)" type="number" min="0" step="0.01" defaultValue={product?.price} error={getFieldError('price')} required />
            <Input name="mrp" label="MRP (₹)" type="number" min="0" step="0.01" defaultValue={product?.mrp} error={getFieldError('mrp')} required />
            <Input name="stock" label="Total stock" type="number" min="0" defaultValue={product?.stock ?? 0} />
            <Input name="lowStockThreshold" label="Low-stock alert at" type="number" min="0" defaultValue={product?.lowStockThreshold ?? 5} />
            <div className="md:col-span-2"><Textarea name="description" label="Description" defaultValue={product?.description} minLength="10" error={getFieldError('description')} required /></div>
            <div className="md:col-span-2"><Textarea name="highlights" label="Highlights (one per line)" defaultValue={asLines(product?.highlights)} helper="Shown as product benefits on the detail page." /></div>
            {showEyeglassLensConfiguration && (
              <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-200 bg-brand-50 p-3">
                <div>
                  <p className="text-sm font-semibold text-brand-900">Need to add or edit lenses?</p>
                  <p className="mt-0.5 text-xs text-navy-500">Power types, lens packages, prices, and eye-power fields are configured below.</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={scrollToLensConfiguration}>Go to lens setup</Button>
              </div>
            )}
          </div>
        </section>

        {contactLensMode && (
          <section className="rounded-2xl border border-brand-200 bg-brand-50/40 p-4 sm:p-5">
            <div className="mb-4">
              <h3 className="font-semibold text-navy-900">Contact lens configuration</h3>
              <p className="mt-1 text-sm text-navy-500">Configure clear lenses, colour lenses, solutions, or accessories for the customer product page.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Select
                label="Contact product type"
                value={contactLens.kind}
                onChange={(event) => updateContactLens('kind', event.target.value)}
                options={[
                  { value: 'clear', label: 'Clear contacts' },
                  { value: 'color', label: 'Colour contacts' },
                  { value: 'solution', label: 'Solutions' },
                  { value: 'accessory', label: 'Accessories' },
                ]}
              />
              <Input label="Wear schedule / product label (optional)" value={contactLens.wearSchedule || ''} onChange={(event) => updateContactLens('wearSchedule', event.target.value)} placeholder="Monthly disposable, 60 ml, travel kit" />
              <Input label="Lenses per box (optional)" type="number" min="1" value={contactLens.lensesPerBox || ''} onChange={(event) => updateContactLens('lensesPerBox', event.target.value)} helper="Leave blank when this information is not needed." />
            </div>

            {(contactLens.kind === 'clear' || contactLens.kind === 'color') && (
              <div className="mt-5">
                <p className="text-sm font-semibold text-navy-800">Power types customers can choose</p>
                <div className="mt-2 flex flex-wrap gap-3">
                  {[['zero-power', 'Zero Power'], ['with-power', 'With Power']].map(([value, label]) => (
                    <label key={value} className="inline-flex items-center gap-2 rounded-lg border border-navy-200 bg-surface px-3 py-2 text-sm text-navy-700">
                      <input
                        type="checkbox"
                        checked={contactLens.powerModes.includes(value)}
                        onChange={(event) => updateContactLens('powerModes', event.target.checked
                          ? [...new Set([...contactLens.powerModes, value])]
                          : contactLens.powerModes.filter((item) => item !== value))}
                        className="accent-brand-500"
                      />
                      {label}
                    </label>
                  ))}
                </div>
                <div className="mt-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-navy-800">Power types and limits</p>
                      <p className="mt-1 text-xs text-navy-500">Add each prescription value customers can select, then set its minimum, maximum, and increment.</p>
                    </div>
                    <Button type="button" variant="outline" size="sm" disabled={contactLens.powerTypes.length >= 12} onClick={() => updateContactLens('powerTypes', [...contactLens.powerTypes, createContactPowerType()])}>Add power type</Button>
                  </div>
                  {getFieldError('contactLens.powerTypes') && <p className="mt-2 text-xs text-error">{getFieldError('contactLens.powerTypes')}</p>}
                  <div className="mt-3 space-y-3">
                    {contactLens.powerTypes.map((powerType, index) => (
                      <div key={index} className="grid gap-3 rounded-xl border border-navy-100 bg-surface p-3 md:grid-cols-[minmax(0,1.4fr)_0.8fr_0.8fr_0.8fr_auto]">
                        <Input label={`Power type ${index + 1}`} value={powerType.name} onChange={(event) => updateContactLens('powerTypes', contactLens.powerTypes.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item))} placeholder="Spherical, Cylindrical, Axis" />
                        <Input label="Minimum" type="number" min="-200" max="200" step="any" value={powerType.min} onChange={(event) => updateContactLens('powerTypes', contactLens.powerTypes.map((item, itemIndex) => itemIndex === index ? { ...item, min: event.target.value } : item))} placeholder="-3.00" />
                        <Input label="Maximum" type="number" min="-200" max="200" step="any" value={powerType.max} onChange={(event) => updateContactLens('powerTypes', contactLens.powerTypes.map((item, itemIndex) => itemIndex === index ? { ...item, max: event.target.value } : item))} placeholder="3.00" />
                        <Input label="Increment" type="number" min="0.01" max="200" step="any" value={powerType.step} onChange={(event) => updateContactLens('powerTypes', contactLens.powerTypes.map((item, itemIndex) => itemIndex === index ? { ...item, step: event.target.value } : item))} placeholder="0.25" />
                        <Button type="button" variant="ghost" size="sm" className="self-end text-error hover:bg-error/10 hover:text-error" disabled={contactLens.powerTypes.length === 1} onClick={() => updateContactLens('powerTypes', contactLens.powerTypes.filter((_, itemIndex) => itemIndex !== index))}>Remove</Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><p className="text-sm font-semibold text-navy-800">Pack / quantity options (optional)</p><p className="text-xs text-navy-500">Add only when the product has choices, such as 3 lenses/box, 60 ml, or a designer case.</p></div>
                <Button type="button" variant="outline" size="sm" onClick={() => updateContactLens('packOptions', [...contactLens.packOptions, createContactPack()])}>Add option</Button>
              </div>
              <div className="mt-3 space-y-3">
                {contactLens.packOptions.map((pack, index) => (
                  <div key={index} className="grid gap-3 rounded-xl border border-navy-100 bg-surface p-3 md:grid-cols-[minmax(0,1.6fr)_0.7fr_0.8fr_0.8fr_auto]">
                    <Input label={`Option ${index + 1}`} value={pack.label} onChange={(event) => updateContactLens('packOptions', contactLens.packOptions.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item))} placeholder="3 lenses/box" />
                    <Input label="Units" type="number" min="1" value={pack.units} onChange={(event) => updateContactLens('packOptions', contactLens.packOptions.map((item, itemIndex) => itemIndex === index ? { ...item, units: event.target.value } : item))} />
                    <Input label="Price (₹)" type="number" min="0" value={pack.price} onChange={(event) => updateContactLens('packOptions', contactLens.packOptions.map((item, itemIndex) => itemIndex === index ? { ...item, price: event.target.value } : item))} />
                    <Input label="MRP (₹)" type="number" min="0" value={pack.mrp} onChange={(event) => updateContactLens('packOptions', contactLens.packOptions.map((item, itemIndex) => itemIndex === index ? { ...item, mrp: event.target.value } : item))} />
                    <Button type="button" variant="ghost" size="sm" className="self-end text-error hover:bg-error/10 hover:text-error" onClick={() => updateContactLens('packOptions', contactLens.packOptions.filter((_, itemIndex) => itemIndex !== index))}>Remove</Button>
                  </div>
                ))}
              </div>
            </div>

            {contactLens.kind === 'color' && (
              <div className="mt-5 border-t border-brand-100 pt-5">
                <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold text-navy-800">Available colours</p><p className="text-xs text-navy-500">Colour selection can change the product gallery.</p></div><Button type="button" variant="outline" size="sm" onClick={() => updateContactLens('availableColors', [...contactLens.availableColors, createContactColor()])}>Add colour</Button></div>
                <div className="mt-3 space-y-3">
                  {contactLens.availableColors.map((color, index) => (
                    <div key={index} className="rounded-xl border border-navy-100 bg-surface p-3">
                      <div className="grid gap-3 md:grid-cols-[1fr_120px_auto]"><Input label="Colour name" value={color.name} onChange={(event) => updateContactLens('availableColors', contactLens.availableColors.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item))} placeholder="Spicy Gray" /><label className="text-sm font-medium text-navy-700">Swatch<input type="color" value={color.hex || '#6B7280'} onChange={(event) => updateContactLens('availableColors', contactLens.availableColors.map((item, itemIndex) => itemIndex === index ? { ...item, hex: event.target.value } : item))} className="mt-1.5 block h-11 w-full rounded-xl border border-navy-200 bg-surface p-1" /></label><Button type="button" variant="ghost" size="sm" className="self-end text-error hover:bg-error/10 hover:text-error" onClick={() => updateContactLens('availableColors', contactLens.availableColors.filter((_, itemIndex) => itemIndex !== index))}>Remove</Button></div>
                      <Textarea label="Images for this colour (one URL per line)" value={asLines(color.images)} onChange={(event) => updateContactLens('availableColors', contactLens.availableColors.map((item, itemIndex) => itemIndex === index ? { ...item, images: event.target.value.split('\n').map(normalizeImageSource).filter(Boolean) } : item))} rows={2} containerClassName="mt-3" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        <section>
          <h3 className="mb-3 font-semibold text-navy-900">Gallery and colour variants</h3>
          <div className="space-y-4">
            <Textarea
              name="images"
              label="Main image URLs (one per line)"
              value={mainImageUrls}
              onChange={(event) => setMainImageUrls(event.target.value)}
              helper="Paste direct image URLs here. You can also add photos or replace the complete gallery below."
              error={getFieldError('images')}
            />
            <div>
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-navy-200 bg-surface-subtle px-5 py-6 text-center">
                <span className="text-sm font-semibold text-navy-700">{preparingImages ? 'Preparing image files...' : 'Upload product photos'}</span>
                <span className="mt-1 text-xs text-navy-400">JPEG, PNG or WebP — {mainImages.length}/{MAX_UPLOADED_IMAGES} gallery images</span>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  <Button type="button" variant="outline" size="sm" disabled={preparingImages || mainImages.length >= MAX_UPLOADED_IMAGES} onClick={() => chooseMainImages('add')}>Add photos</Button>
                  {editing && <Button type="button" variant="secondary" size="sm" disabled={preparingImages} onClick={() => chooseMainImages('replace')}>Replace gallery</Button>}
                </div>
                <input ref={mainImageInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={uploadImages} />
              </div>
              {mainImages.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
                  {mainImages.map((image, index) => (
                    <div key={`${image.slice(0, 48)}-${index}`} className="relative aspect-square overflow-hidden rounded-xl border border-navy-100 bg-surface-subtle">
                      <img src={getOptimizedImageUrl(image, 240)} alt={`Product gallery ${index + 1}`} className="h-full w-full object-cover" />
                      <button type="button" onClick={() => removeMainImage(index)} className="absolute right-1 top-1 rounded-full bg-navy-900/80 px-2 py-1 text-xs font-bold text-white" aria-label={`Remove product image ${index + 1}`}>×</button>
                      {index === 0 && <span className="absolute bottom-1 left-1 rounded bg-brand-500 px-1.5 py-0.5 text-[10px] font-bold text-white">MAIN</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-navy-700">Colour variants</p>
                  <p className="mt-1 text-xs text-navy-400">Give each colour its own photos. Selecting it on the product page will switch the gallery.</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => setVariants((current) => [...current, createEmptyVariant()])}>Add colour</Button>
              </div>
              {getFieldError('variants') && <p className="text-sm text-error">{getFieldError('variants')}</p>}
              {variants.map((variant, index) => (
                <div key={variant._id || index} className="rounded-2xl border border-navy-100 bg-surface-subtle p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <p className="font-semibold text-navy-800">Colour {index + 1}</p>
                    <Button type="button" variant="ghost" size="sm" className="text-error hover:bg-error/10 hover:text-error" onClick={() => setVariants((current) => current.filter((_, itemIndex) => itemIndex !== index))}>Remove</Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input label="Colour label" value={variant.color} onChange={(event) => updateVariant(index, 'color', event.target.value)} placeholder="e.g. Gunmetal / Silver" />
                    <Input label="Colour SKU" value={variant.sku} onChange={(event) => updateVariant(index, 'sku', event.target.value)} placeholder="e.g. OC-GUN-SIL" />
                    <Input label="Primary colour name (top)" value={variant.primaryColor} onChange={(event) => updateVariant(index, 'primaryColor', event.target.value)} placeholder="e.g. Gunmetal" />
                    <Input label="Secondary colour name (bottom)" value={variant.secondaryColor} onChange={(event) => updateVariant(index, 'secondaryColor', event.target.value)} placeholder="e.g. Silver" />
                    <label className="text-sm font-medium text-navy-700">Primary colour (top)
                      <input type="color" value={variant.primaryColorHex || '#4B5563'} onChange={(event) => updateVariant(index, 'primaryColorHex', event.target.value)} className="mt-1.5 block h-11 w-full cursor-pointer rounded-xl border border-navy-200 bg-surface p-1" aria-label={`Primary colour for colour ${index + 1}`} />
                    </label>
                    <label className="text-sm font-medium text-navy-700">Secondary colour (bottom)
                      <input type="color" value={variant.secondaryColorHex || '#C4C7CC'} onChange={(event) => updateVariant(index, 'secondaryColorHex', event.target.value)} className="mt-1.5 block h-11 w-full cursor-pointer rounded-xl border border-navy-200 bg-surface p-1" aria-label={`Secondary colour for colour ${index + 1}`} />
                    </label>
                    <Input label="Stock for this colour" type="number" min="0" value={variant.stock} onChange={(event) => updateVariant(index, 'stock', event.target.value)} />
                    <div className="flex items-end gap-3 pb-0.5">
                      <span className="h-11 w-11 rounded-full border-2 border-white shadow-soft" style={{ background: `linear-gradient(to bottom, ${variant.primaryColorHex || '#4B5563'} 0 50%, ${variant.secondaryColorHex || '#C4C7CC'} 50% 100%)` }} aria-hidden="true" />
                      <span className="text-xs text-navy-400">Primary is above secondary on the product-page swatch.</span>
                    </div>
                  </div>
                  <Textarea
                    label={`Images for colour ${index + 1} (one URL per line)`}
                    value={(variant.images || []).filter((image) => !image.startsWith('data:image/')).join('\n')}
                    onChange={(event) => {
                      const uploaded = (variant.images || []).filter((image) => image.startsWith('data:image/'));
                      updateVariant(index, 'images', [...event.target.value.split('\n').map(normalizeImageSource).filter(Boolean), ...uploaded]);
                    }}
                    helper="These photos are shown when this colour is selected. You can also upload images below."
                    rows={3}
                    containerClassName="mt-4"
                  />
                  <div className="mt-3 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-navy-200 bg-surface px-5 py-5 text-center">
                    <span className="text-sm font-semibold text-navy-700">{preparingImages ? 'Preparing image files...' : `Upload photos for colour ${index + 1}`}</span>
                    <span className="mt-1 text-xs text-navy-400">JPEG, PNG or WebP — up to {Math.max(0, MAX_UPLOADED_IMAGES - (variant.images?.length || 0))} more</span>
                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={preparingImages || (variant.images?.length || 0) >= MAX_UPLOADED_IMAGES}
                        onClick={() => {
                          variantImageUploadModesRef.current[index] = 'add';
                          variantImageInputRefs.current[index]?.click();
                        }}
                      >
                        Add photos
                      </Button>
                      {editing && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          disabled={preparingImages}
                          onClick={() => {
                            variantImageUploadModesRef.current[index] = 'replace';
                            variantImageInputRefs.current[index]?.click();
                          }}
                        >
                          Replace colour photos
                        </Button>
                      )}
                    </div>
                    <input ref={(node) => { variantImageInputRefs.current[index] = node; }} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(event) => uploadVariantImages(index, event)} />
                  </div>
                  {variant.images?.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5">
                      {variant.images.map((image, imageIndex) => (
                        <div key={`${image.slice(0, 48)}-${imageIndex}`} className="relative aspect-square overflow-hidden rounded-xl border border-navy-100 bg-surface">
                          <img src={getOptimizedImageUrl(image, 240)} alt={`${variant.color || `Colour ${index + 1}`} — ${imageIndex + 1}`} className="h-full w-full object-cover" />
                          <button type="button" onClick={() => updateVariant(index, 'images', variant.images.filter((_, itemIndex) => itemIndex !== imageIndex))} className="absolute right-1 top-1 rounded-full bg-navy-900/80 px-2 py-1 text-xs font-bold text-white" aria-label={`Remove colour ${index + 1} image ${imageIndex + 1}`}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Input name="frameColor" label="Frame colour description" defaultValue={product?.frameColor} helper="Used in product details and search." />
          </div>
        </section>

        <section>
          <h3 className="mb-3 font-semibold text-navy-900">Frame specifications</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-navy-100 bg-surface p-3">
              <p className="text-sm font-medium text-navy-700">Designed for</p>
              <p className="mt-1 text-xs text-navy-500">Select every customer group this product is designed for.</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {GENDERS.map((value) => {
                  const selected = product?.genders?.length ? product.genders : [product?.gender || 'unisex'];
                  return (
                    <Checkbox
                      key={value}
                      name="genders"
                      value={value}
                      label={humanize(value)}
                      defaultChecked={selected.includes(value)}
                    />
                  );
                })}
              </div>
              {getFieldError('genders') && <p className="mt-2 text-sm text-error">{getFieldError('genders')}</p>}
            </div>
            <Select name="frameShape" label="Frame shape" defaultValue={product?.frameShape || ''} placeholder="Select shape" options={FRAME_SHAPES.map((value) => ({ value, label: humanize(value) }))} error={getFieldError('frameShape')} />
            <Select name="frameType" label="Frame type" defaultValue={product?.frameType || ''} placeholder="Select type" options={FRAME_TYPES.map((value) => ({ value, label: humanize(value) }))} error={getFieldError('frameType')} />
            <Select name="rimType" label="Rim type" defaultValue={product?.rimType || ''} placeholder="Select rim type" options={FRAME_TYPES.map((value) => ({ value, label: humanize(value) }))} error={getFieldError('rimType')} />
            <Select name="frameMaterial" label="Frame material" defaultValue={product?.frameMaterial || ''} placeholder="Select material" options={FRAME_MATERIALS.map((value) => ({ value, label: humanize(value) }))} error={getFieldError('frameMaterial')} />
            <Select name="frameSize" label="Frame fit" defaultValue={product?.frameSize || 'medium'} options={FRAME_SIZES.map((value) => ({ value, label: humanize(value) }))} error={getFieldError('frameSize')} />
            <Input name="frameWidth" label="Frame width (mm)" type="number" min="0" defaultValue={product?.frameWidth} />
            <Input name="lensWidth" label="Lens width (mm)" type="number" min="0" defaultValue={product?.lensWidth} />
            <Input name="bridgeSize" label="Bridge size (mm)" type="number" min="0" defaultValue={product?.bridgeSize} />
            <Input name="templeSize" label="Temple size (mm)" type="number" min="0" defaultValue={product?.templeSize} />
            <div className="md:col-span-2"><Input name="suitableFaceShapes" label="Suitable face shapes" defaultValue={asCommaList(product?.suitableFaceShapes)} helper="Comma-separated: oval, round, square, heart, oblong, diamond." error={getFieldError('suitableFaceShapes') || getFieldError('suitableFaceShapes.0')} /></div>
          </div>
        </section>

        {showEyeglassLensConfiguration && (
          <section ref={lensConfigurationRef} className="scroll-mt-4 rounded-2xl border border-brand-200 bg-brand-50/30 p-4 sm:p-5">
            <div className="mb-5">
              <h3 className="font-semibold text-navy-900">Eyeglass lens configuration</h3>
              <p className="mt-1 text-sm text-navy-500">Control the power choices, compatible lens packages, and manual prescription fields shown after a customer selects lenses.</p>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-navy-800">1. Power types shown to customers</h4>
                  <p className="mt-1 text-xs text-navy-500">The stable ID connects each mode to its packages and prescription fields. Labels can be changed freely.</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={lensOptions.length >= MAX_LENS_POWER_MODES}
                  onClick={() => setLensOptions((current) => [...current, createLensOption(current)])}
                >
                  Add power mode
                </Button>
              </div>
              {getFieldError('lensOptions') && <p className="mt-2 text-sm text-error">{getFieldError('lensOptions')}</p>}
              <div className="mt-3 space-y-3">
                {lensOptions.map((option, index) => (
                  <div key={`${option.type}-${index}`} className="rounded-xl border border-navy-100 bg-surface p-3 sm:p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-navy-800">Power mode {index + 1}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-error hover:bg-error/10 hover:text-error"
                        aria-label={`Remove power mode ${index + 1}`}
                        onClick={() => removeLensOption(index)}
                      >
                        Remove
                      </Button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                      <Input
                        label={`Power mode ${index + 1} ID`}
                        value={option.type}
                        maxLength={60}
                        onChange={(event) => updateLensOption(index, 'type', event.target.value)}
                        placeholder="single-vision"
                        helper="Lowercase; use hyphens or underscores."
                      />
                      <Input
                        label={`Power mode ${index + 1} name`}
                        value={option.label}
                        maxLength={80}
                        onChange={(event) => updateLensOption(index, 'label', event.target.value)}
                        placeholder="With Power"
                      />
                      <Input
                        label="Supporting text"
                        value={option.subtitle}
                        maxLength={160}
                        onChange={(event) => updateLensOption(index, 'subtitle', event.target.value)}
                        placeholder="Positive, negative or cylindrical"
                      />
                      <Input
                        label="Badge (optional)"
                        value={option.badge}
                        maxLength={40}
                        onChange={(event) => updateLensOption(index, 'badge', event.target.value)}
                        placeholder="Most common"
                      />
                      <Input
                        label="Additional price (₹)"
                        type="number"
                        min="0"
                        step="0.01"
                        value={option.price}
                        onChange={(event) => updateLensOption(index, 'price', event.target.value)}
                      />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-5 rounded-lg bg-surface-subtle px-3 py-2.5">
                      <Checkbox
                        label="Prescription required"
                        checked={option.requiresPrescription}
                        onChange={(event) => updateLensOption(index, 'requiresPrescription', event.target.checked)}
                      />
                      <Checkbox
                        label={`Power mode ${index + 1} is active`}
                        checked={option.isActive}
                        onChange={(event) => updateLensOption(index, 'isActive', event.target.checked)}
                      />
                    </div>
                  </div>
                ))}
                {!lensOptions.length && <p className="rounded-xl border border-dashed border-navy-200 bg-surface p-4 text-sm text-navy-500">No power modes configured yet.</p>}
              </div>
            </div>

            <div className="mt-6 border-t border-brand-100 pt-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-navy-800">2. Lens packages</h4>
                  <p className="mt-1 text-xs text-navy-500">Add the lens cards customers can choose, then select which power modes can see each one.</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={lensPackages.length >= MAX_LENS_PACKAGES}
                  onClick={() => setLensPackages((current) => [...current, createLensPackage(current)])}
                >
                  Add lens package
                </Button>
              </div>
              {getFieldError('lensPackages') && <p className="mt-2 text-sm text-error">{getFieldError('lensPackages')}</p>}
              <div className="mt-3 space-y-3">
                {lensPackages.map((lensPackage, index) => (
                  <div key={`${lensPackage.id}-${index}`} className="rounded-xl border border-navy-100 bg-surface p-3 sm:p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-navy-800">Lens package {index + 1}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-error hover:bg-error/10 hover:text-error"
                        aria-label={`Remove lens package ${index + 1}`}
                        onClick={() => setLensPackages((current) => current.filter((_, packageIndex) => packageIndex !== index))}
                      >
                        Remove
                      </Button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <Input
                        label={`Lens package ${index + 1} ID`}
                        value={lensPackage.id}
                        maxLength={60}
                        onChange={(event) => updateLensPackage(index, 'id', event.target.value)}
                        placeholder="anti-glare-premium"
                        helper="Stable lowercase ID."
                      />
                      <Input
                        label={`Lens package ${index + 1} name`}
                        value={lensPackage.name}
                        maxLength={100}
                        onChange={(event) => updateLensPackage(index, 'name', event.target.value)}
                        placeholder="Anti-Glare Premium"
                      />
                      <Input
                        label="Card badge (optional)"
                        value={lensPackage.badge}
                        maxLength={40}
                        onChange={(event) => updateLensPackage(index, 'badge', event.target.value)}
                        placeholder="Free lenses"
                      />
                      <Input
                        label="Warranty (months)"
                        type="number"
                        min="0"
                        max="120"
                        step="1"
                        value={lensPackage.warrantyMonths}
                        onChange={(event) => updateLensPackage(index, 'warrantyMonths', event.target.value)}
                        placeholder="12"
                      />
                      <Input
                        label="Selling price (₹)"
                        type="number"
                        min="0"
                        step="0.01"
                        value={lensPackage.price}
                        onChange={(event) => updateLensPackage(index, 'price', event.target.value)}
                      />
                      <Input
                        label="MRP (₹)"
                        type="number"
                        min="0"
                        step="0.01"
                        value={lensPackage.mrp}
                        onChange={(event) => updateLensPackage(index, 'mrp', event.target.value)}
                      />
                      <Input
                        label="Filter tags"
                        value={asCommaList(lensPackage.tags)}
                        onChange={(event) => updateLensPackage(index, 'tags', event.target.value.split(',').map((value) => value.trim()).filter(Boolean))}
                        placeholder="Bestsellers, Work Friendly"
                        helper="Comma-separated."
                      />
                      <Input
                        label="Card image URL (optional)"
                        value={lensPackage.image}
                        maxLength={2000}
                        onChange={(event) => updateLensPackage(index, 'image', event.target.value)}
                        placeholder="https://example.com/lens.jpg"
                      />
                      <div className="md:col-span-2 xl:col-span-4">
                        <Textarea
                          label="Description"
                          value={lensPackage.description}
                          maxLength={300}
                          onChange={(event) => updateLensPackage(index, 'description', event.target.value)}
                          rows={2}
                          placeholder="Double-side anti-glare lenses for everyday use."
                        />
                      </div>
                      <div className="md:col-span-2 xl:col-span-4">
                        <Textarea
                          label="Features (one per line)"
                          value={asLines(lensPackage.features)}
                          onChange={(event) => updateLensPackage(index, 'features', event.target.value.split('\n').map((value) => value.trim()).filter(Boolean))}
                          rows={3}
                          placeholder={'Double Side Anti-Glare Lens\nScratch Resistant'}
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <LensApplicabilitySelector
                        label={`Show for — lens package ${index + 1}`}
                        selected={lensPackage.powerTypes}
                        powerModes={lensOptions}
                        onChange={(value) => updateLensPackage(index, 'powerTypes', value)}
                      />
                    </div>
                    <div className="mt-3 rounded-lg bg-surface-subtle px-3 py-2.5">
                      <Checkbox
                        label={`Lens package ${index + 1} is active`}
                        checked={lensPackage.isActive}
                        onChange={(event) => updateLensPackage(index, 'isActive', event.target.checked)}
                      />
                    </div>
                  </div>
                ))}
                {!lensPackages.length && <p className="rounded-xl border border-dashed border-navy-200 bg-surface p-4 text-sm text-navy-500">No lens packages configured. Add one when customers should choose a lens after selecting their power mode.</p>}
              </div>
            </div>

            <div className="mt-6 border-t border-brand-100 pt-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-semibold text-navy-800">3. Enter eye power fields</h4>
                  <p className="mt-1 text-xs text-navy-500">Set each value&apos;s range and whether customers enter it once or separately for the right and left eye.</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={lensPrescriptionFields.length >= MAX_LENS_PRESCRIPTION_FIELDS}
                  onClick={() => setLensPrescriptionFields((current) => [...current, createLensPrescriptionField(current)])}
                >
                  Add prescription field
                </Button>
              </div>
              {getFieldError('lensPrescriptionFields') && <p className="mt-2 text-sm text-error">{getFieldError('lensPrescriptionFields')}</p>}
              <div className="mt-3 space-y-3">
                {lensPrescriptionFields.map((prescriptionField, index) => (
                  <div key={`${prescriptionField.key}-${index}`} className="rounded-xl border border-navy-100 bg-surface p-3 sm:p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-navy-800">Prescription field {index + 1}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-error hover:bg-error/10 hover:text-error"
                        aria-label={`Remove prescription field ${index + 1}`}
                        onClick={() => setLensPrescriptionFields((current) => current.filter((_, fieldIndex) => fieldIndex !== index))}
                      >
                        Remove
                      </Button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                      <Input
                        label={`Prescription field ${index + 1} key`}
                        value={prescriptionField.key}
                        maxLength={60}
                        onChange={(event) => updateLensPrescriptionField(index, 'key', event.target.value)}
                        placeholder="sph"
                        helper="Stable lowercase key."
                      />
                      <Input
                        label={`Prescription field ${index + 1} label`}
                        value={prescriptionField.label}
                        maxLength={80}
                        onChange={(event) => updateLensPrescriptionField(index, 'label', event.target.value)}
                        placeholder="SPH"
                      />
                      <Input
                        label="Minimum"
                        type="number"
                        min="-200"
                        max="200"
                        step="any"
                        value={prescriptionField.min}
                        onChange={(event) => updateLensPrescriptionField(index, 'min', event.target.value)}
                      />
                      <Input
                        label="Maximum"
                        type="number"
                        min="-200"
                        max="200"
                        step="any"
                        value={prescriptionField.max}
                        onChange={(event) => updateLensPrescriptionField(index, 'max', event.target.value)}
                      />
                      <Input
                        label="Increment"
                        type="number"
                        min="0.001"
                        max="400"
                        step="any"
                        value={prescriptionField.step}
                        onChange={(event) => updateLensPrescriptionField(index, 'step', event.target.value)}
                      />
                      <Select
                        label="Input scope"
                        value={prescriptionField.scope}
                        onChange={(event) => updateLensPrescriptionField(index, 'scope', event.target.value)}
                        options={[
                          { value: 'per-eye', label: 'Right and left eye' },
                          { value: 'shared', label: 'One shared value' },
                        ]}
                      />
                    </div>
                    <div className="mt-3">
                      <LensApplicabilitySelector
                        label={`Use for — prescription field ${index + 1}`}
                        selected={prescriptionField.powerTypes}
                        powerModes={lensOptions}
                        onChange={(value) => updateLensPrescriptionField(index, 'powerTypes', value)}
                      />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-5 rounded-lg bg-surface-subtle px-3 py-2.5">
                      <Checkbox
                        label="Required from customer"
                        checked={prescriptionField.required}
                        onChange={(event) => updateLensPrescriptionField(index, 'required', event.target.checked)}
                      />
                      <Checkbox
                        label={`Prescription field ${index + 1} is active`}
                        checked={prescriptionField.isActive}
                        onChange={(event) => updateLensPrescriptionField(index, 'isActive', event.target.checked)}
                      />
                    </div>
                  </div>
                ))}
                {!lensPrescriptionFields.length && <p className="rounded-xl border border-dashed border-navy-200 bg-surface p-4 text-sm text-navy-500">No manual prescription fields configured yet.</p>}
              </div>
            </div>
          </section>
        )}

        <section>
          <h3 className="mb-3 font-semibold text-navy-900">Lenses, protection and policies</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Select name="lensType" label="Lens type" defaultValue={product?.lensType || ''} placeholder="Select lens type" options={LENS_TYPES.map((value) => ({ value, label: humanize(value) }))} error={getFieldError('lensType')} />
            <Input name="lensThickness" label="Lens thickness" defaultValue={product?.lensThickness} placeholder="e.g. 1.56 index" />
            <Input name="warrantyMonths" label="Warranty (months)" type="number" min="0" defaultValue={product?.warrantyMonths ?? 12} />
            <Input name="returnDays" label="Return window (days)" type="number" min="0" defaultValue={product?.returnDays ?? 14} />
            <div className="md:col-span-2 grid gap-4 md:grid-cols-3">
              <Input name="shippingMessage" label="Shipping message" defaultValue={product?.shippingMessage} placeholder="Free shipping" helper="Shown in the delivery assurance card." />
              <Input name="returnMessage" label="Return message" defaultValue={product?.returnMessage} placeholder={`${product?.returnDays ?? 14}-day returns`} helper="Leave blank to use the return window." />
              <Input name="warrantyMessage" label="Warranty message" defaultValue={product?.warrantyMessage} placeholder={`${product?.warrantyMonths ?? 12}mo warranty`} helper="Leave blank to use the warranty period." />
            </div>
            <div className="md:col-span-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <Toggle name="powered" label="Prescription supported" defaultChecked={product?.powered !== false} />
              <Toggle name="blueLightFilter" label="Blue-light filter" defaultChecked={product?.blueLightFilter} />
              <Toggle name="polarized" label="Polarized lenses" defaultChecked={product?.polarized} />
              <Toggle name="uvProtection" label="UV protection" defaultChecked={product?.uvProtection} />
            </div>
          </div>
        </section>

        <section>
          <div className="mb-3">
            <h3 className="font-semibold text-navy-900">Ratings &amp; social proof</h3>
            <p className="mt-1 text-sm text-navy-500">
              The product page automatically fills its star icons from the rating point entered here.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Input
              name="rating"
              label="Star rating point (0–5)"
              type="number"
              min="0"
              max="5"
              step="0.1"
              defaultValue={product?.rating ?? 0}
              helper="Example: 4.6 displays a 4.6 rating and the matching stars."
              error={getFieldError('rating')}
            />
            <Input
              name="numReviews"
              label="Number of reviews"
              type="number"
              min="0"
              step="1"
              defaultValue={product?.numReviews ?? 0}
              helper="Shown next to the rating as the customer review count."
              error={getFieldError('numReviews')}
            />
            <Input
              name="soldCount"
              label="Number of units sold"
              type="number"
              min="0"
              step="1"
              defaultValue={product?.soldCount ?? 0}
              helper="Shown as the product's sold count; existing values are preserved when editing."
              error={getFieldError('soldCount')}
            />
          </div>
        </section>

        <section>
          <h3 className="mb-3 font-semibold text-navy-900">Merchandising</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Input name="tags" label="Tags" defaultValue={asCommaList(product?.tags)} helper="Comma-separated, for search and filters." />
            <Input name="collections" label="Collections" defaultValue={asCommaList(product?.collections)} helper="Comma-separated, for curated storefront sections." />
            <div className="md:col-span-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
              <Toggle name="isActive" label="Published" defaultChecked={product?.isActive !== false} />
              <Toggle name="isBestSeller" label="Best seller" defaultChecked={product?.isBestSeller} />
              <Toggle name="isTrending" label="Trending" defaultChecked={product?.isTrending} />
              <Toggle name="isNewArrival" label="New arrival" defaultChecked={product?.isNewArrival} />
              <Toggle name="isFeatured" label="Featured" defaultChecked={product?.isFeatured} />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-brand-100 bg-brand-50/40 p-4 sm:p-5">
          <div className="mb-4">
            <h3 className="font-semibold text-navy-900">Product promotion card <span className="font-normal text-navy-500">(optional)</span></h3>
            <p className="mt-1 text-sm text-navy-500">This controls the offer card shown beneath the price on this product page. Leave the offer title empty to hide it.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input name="offerHeading" label="Offer heading" defaultValue={product?.promotion?.heading} placeholder="Limited period offer" />
            <Input name="offerTitle" label="Offer title" defaultValue={product?.promotion?.title} placeholder="Buy 1 Get 1 Free" helper="Required only when you want to show the card." />
            <div className="md:col-span-2"><Input name="offerSubtitle" label="Supporting text" defaultValue={product?.promotion?.subtitle} placeholder="On selected eyeglasses" /></div>
          </div>
        </section>

        <div className="flex flex-wrap justify-end gap-3 border-t border-navy-100 pt-5">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>Save product</Button>
        </div>
      </form>
    </Modal>
  );
}

export default ProductEditorModal;
