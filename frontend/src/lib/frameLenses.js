/** Defaults and normalization shared by the frame lens editor and customer flow. */
export const DEFAULT_FRAME_LENSES = {
  powerTypes: [
    {
      price: 0,
      badge: 'Most common',
      badgeColor: 'brand',
      autoAdvance: true,
      isActive: true,
      order: 0,
      id: 'single-vision',
      label: 'With Power',
      subtitle: 'Positive, Negative or Cylindrical',
      icon: 'Eye',
      iconBgColor: 'brand',
      requiresPrescription: true,
    },
    {
      price: 0,
      badge: 'BLU Screen lenses',
      badgeColor: 'brand',
      autoAdvance: true,
      isActive: true,
      order: 1,
      id: 'zero-power',
      label: 'Zero Power',
      subtitle: 'Blue light block for screen protection',
      icon: 'Monitor',
      iconBgColor: 'purple',
      requiresPrescription: false,
    },
    {
      price: 0,
      badge: '',
      badgeColor: 'brand',
      autoAdvance: true,
      isActive: true,
      order: 2,
      id: 'progressive',
      label: 'Progressive/Bifocals',
      subtitle: 'Two powers in one eye',
      icon: 'Layers',
      iconBgColor: 'blue',
      requiresPrescription: true,
    },
    {
      price: 0,
      badge: '',
      badgeColor: 'brand',
      autoAdvance: true,
      isActive: true,
      order: 3,
      id: 'frame-only',
      label: 'Frame Only',
      subtitle: 'With no lenses',
      icon: 'Square',
      iconBgColor: 'grey',
      requiresPrescription: false,
    },
  ],
  packageCategories: [
    {
      id: 'bestsellers',
      label: 'Bestsellers',
      order: 0,
      isActive: true,
    },
    {
      id: 'thin',
      label: 'Thin',
      order: 1,
      isActive: true,
    },
    {
      id: 'screen-lenses',
      label: 'Screen lenses',
      order: 2,
      isActive: true,
    },
    {
      id: 'premium',
      label: 'Premium',
      order: 3,
      isActive: true,
    },
  ],
  packages: [
    {
      id: 'anti-glare',
      name: 'Anti-Glare Premium',
      price: 0,
      features: ['Anti-Glare coating', 'Scratch resistant'],
      badge: 'Included',
      categories: ['bestsellers'],
      order: 0,
      description: 'Anti-Glare coating. Scratch resistant',
      imageUrl: '',
      isRecommended: false,
      isActive: true,
      powerTypes: ['single-vision', 'zero-power', 'progressive'],
    },
    {
      id: 'blu-screen',
      name: 'BLU Screen Protection',
      price: 500,
      features: ['Blue light filtering', 'Anti-glare', 'Reduces eye strain'],
      badge: 'Screen favourite',
      categories: ['bestsellers', 'screen-lenses'],
      order: 1,
      description: 'Blue light filtering. Anti-glare. Reduces eye strain',
      imageUrl: '',
      isRecommended: false,
      isActive: true,
      powerTypes: ['single-vision', 'zero-power', 'progressive'],
    },
    {
      id: 'blu-thin',
      name: 'BLU Thin',
      price: 1200,
      features: ['Blue light filter', 'Thin lenses', 'Anti-glare'],
      badge: 'Best for powers ±3',
      categories: ['thin', 'screen-lenses'],
      order: 2,
      description: 'Blue light filter. Thin lenses. Anti-glare',
      imageUrl: '',
      isRecommended: false,
      isActive: true,
      powerTypes: ['single-vision', 'zero-power', 'progressive'],
    },
    {
      id: 'photochromic',
      name: 'Photochromic Comfort',
      price: 1500,
      features: ['Darkens in sunlight', 'UV 400 protection', 'Anti-glare'],
      badge: 'Outdoor ready',
      categories: ['premium'],
      order: 3,
      description: 'Darkens in sunlight. UV 400 protection. Anti-glare',
      imageUrl: '',
      isRecommended: false,
      isActive: true,
      powerTypes: ['single-vision', 'zero-power', 'progressive'],
    },
    {
      id: 'ultra-thin',
      name: 'Ultra Thin',
      price: 2500,
      features: ['Thinnest lenses', 'All coatings included', 'For high power'],
      badge: 'High power ±6',
      categories: ['thin', 'premium'],
      order: 4,
      description: 'Thinnest lenses. All coatings included. For high power',
      imageUrl: '',
      isRecommended: false,
      isActive: true,
      powerTypes: ['single-vision', 'zero-power', 'progressive'],
    },
  ],
  prescriptionFields: [
    {
      key: 'sph',
      label: 'SPH',
      min: -20,
      max: 20,
      step: 0.25,
      scope: 'per-eye',
      required: true,
      fieldType: 'dropdown',
      placeholder: 'Select SPH',
      helpText: '',
      isActive: true,
      powerTypes: ['single-vision', 'progressive'],
    },
    {
      key: 'cyl',
      label: 'CYL',
      min: -10,
      max: 0,
      step: 0.25,
      scope: 'per-eye',
      required: false,
      fieldType: 'dropdown',
      placeholder: 'Select CYL',
      helpText: '',
      isActive: true,
      powerTypes: ['single-vision', 'progressive'],
    },
    {
      key: 'axis',
      label: 'Axis',
      min: 1,
      max: 180,
      step: 1,
      scope: 'per-eye',
      required: false,
      fieldType: 'dropdown',
      placeholder: 'Select Axis',
      helpText: '',
      isActive: true,
      powerTypes: ['single-vision', 'progressive'],
    },
    {
      key: 'add',
      label: 'ADD',
      min: 0.75,
      max: 3.5,
      step: 0.25,
      scope: 'per-eye',
      required: true,
      fieldType: 'dropdown',
      placeholder: 'Select ADD',
      helpText: '',
      isActive: true,
      powerTypes: ['progressive'],
    },
    {
      key: 'pd',
      label: 'PD',
      min: 50,
      max: 80,
      step: 1,
      scope: 'shared',
      required: true,
      fieldType: 'dropdown',
      placeholder: 'Select PD',
      helpText: '',
      isActive: true,
      powerTypes: ['single-vision', 'progressive'],
    },
  ],
  generalSettings: {
    uiText: {
      powerTitle: 'Select your Power Type:',
      lensesTitle: 'Select your lenses:',
      learnMore: 'Learn more ›',
      knowMore: 'Know more',
      included: 'Included',
      recommended: 'Recommended',
      continue: 'Continue',
      back: 'Back',
      total: 'Total',
      frame: 'Frame',
      lens: 'Lens',
      ready: 'Your lens selection is ready',
      laterTitle: 'Submit power later',
      laterSubtitle: 'Provide your prescription after placing the order via email or call',
      manualTitle: 'Enter power manually',
      manualSubtitle: 'Use values from your latest eye prescription',
      uploadTitle: 'Upload prescription',
      uploadSubtitle: 'Choose an image or PDF of your prescription',
      rightEye: 'Right Eye (OD)',
      leftEye: 'Left Eye (OS)',
      emptyPower: 'No power types are available.',
      emptyPackages: 'No lenses in this category. Try another category.',
      requiredMessage: 'Complete all required fields using the allowed values.',
      chooseFile: 'Choose prescription file',
      dropFile: 'Drag a file here (up to 2 MB)',
    },
    drawerTitle: 'Select Lens Type',
    stepLabels: ['Power Type', 'Lenses', 'Add Power'],
    learnMoreUrl: '',
    showRunningTotal: true,
    ctaText: 'Add to Cart',
    noPrescriptionMessage: 'No prescription needed for this selection',
    autoAdvance: true,
  },
};

export function normalizeFrameLenses(raw = {}) {
  const result = {
    generalSettings: { ...DEFAULT_FRAME_LENSES.generalSettings, ...raw.generalSettings },
  };
  result.generalSettings.uiText = {
    ...DEFAULT_FRAME_LENSES.generalSettings.uiText,
    ...raw.generalSettings?.uiText,
  };
  for (const group of ['powerTypes', 'packageCategories', 'packages', 'prescriptionFields']) {
    result[group] = (raw[group] ?? DEFAULT_FRAME_LENSES[group]).map((item, order) => ({
      ...(DEFAULT_FRAME_LENSES[group].find(
        (entry) => (entry.id || entry.key) === (item.id || item.key)
      ) || {}),
      order,
      isActive: true,
      ...item,
    }));
  }
  return result;
}
export const activeSorted = (items) =>
  items
    .filter((item) => item.isActive !== false)
    .slice()
    .sort((a, b) => (a.order || 0) - (b.order || 0));
export const appliesTo = (item, id) => !item.powerTypes?.length || item.powerTypes.includes(id);
export function powerChoices(field) {
  const { min, max, step } = field;
  if (
    ![min, max, step].every(Number.isFinite) ||
    step <= 0 ||
    max < min ||
    (max - min) / step > 5000
  )
    return [];
  return Array.from({ length: Math.floor((max - min) / step + 1e-8) + 1 }, (_, i) => {
    const value = Number((min + i * step).toFixed(4));
    return {
      value: String(value),
      label: step < 1 ? (value > 0 ? '+' : '') + value.toFixed(2) : String(value),
    };
  });
}
