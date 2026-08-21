/**
 * Cart business logic. Product and lens prices are resolved from the live
 * catalog; labels, prices, and compatibility sent by clients are not trusted.
 */
import { createHash } from 'node:crypto';
import { cartRepository, productRepository } from '../repositories/index.js';
import { ApiError } from '../utils/ApiError.js';

const LEGACY_POWER_MODES = {
  'single-vision': {
    label: 'With Power', subtitle: 'Positive, negative or cylindrical', price: 0,
  },
  'with-power': {
    label: 'With Power', subtitle: 'Positive, negative or cylindrical', price: 0,
  },
  'zero-power': {
    label: 'Zero Power', subtitle: 'Screen glasses with no prescription', price: 0,
  },
  'blue-light': {
    label: 'Blue-Light Block', subtitle: 'Screen glasses with no prescription', price: 0,
  },
  progressive: {
    label: 'Progressive / Bifocals', subtitle: 'Two powers in one lens', price: 1200,
  },
  bifocal: {
    label: 'Bifocal', subtitle: 'Near and distance correction', price: 0,
  },
  'frame-only': {
    label: 'Frame Only', subtitle: 'With no lenses', price: 0,
  },
};

// Server-owned fallbacks for products created before configurable packages.
const LEGACY_LENS_PACKAGES = {
  'anti-glare': {
    id: 'anti-glare', name: 'Anti-Glare Premium', badge: 'Included',
    description: 'Clear everyday lenses with dependable protection.',
    features: ['Double-sided anti-glare', 'Scratch resistant'],
    warrantyMonths: 6, price: 0, mrp: 0, tags: ['Bestsellers'],
  },
  'blu-screen': {
    id: 'blu-screen', name: 'BLU Screen Protection', badge: 'Screen favourite',
    description: 'Comfortable lenses for phones, laptops and other screens.',
    features: ['Blue-light filtering', 'Reduces eye strain'],
    warrantyMonths: 12, price: 250, mrp: 500, tags: ['Bestsellers', 'Work friendly'],
  },
  photochromic: {
    id: 'photochromic', name: 'Photochromic Comfort', badge: 'Outdoor ready',
    description: 'Adaptive lenses for changing indoor and outdoor light.',
    features: ['Darkens in sunlight', 'UV protection'],
    warrantyMonths: 12, price: 1000, mrp: 1500, tags: ['High power'],
  },
};

const text = (value) => String(value ?? '').trim();
const lower = (value) => text(value).toLowerCase();

function toPlain(value) {
  if (!value) return value;
  if (typeof value.toObject === 'function') return value.toObject({ flattenMaps: true });
  if (value instanceof Map) return Object.fromEntries(value);
  return value;
}

function valuesObject(values) {
  const plain = toPlain(values);
  if (!plain || typeof plain !== 'object' || Array.isArray(plain)) return {};
  return Object.fromEntries(Object.entries(plain).map(([key, value]) => [key, text(value)]));
}

function legacyPrescriptionValues(raw) {
  const values = {};
  const addEye = (source, eyeLabel) => {
    const eye = toPlain(source) || {};
    const labels = { sph: 'SPH', cyl: 'CYL', axis: 'AXIS' };
    Object.entries(labels).forEach(([key, label]) => {
      if (eye[key] != null && text(eye[key]) !== '') {
        values[`${eyeLabel} · ${label}`] = text(eye[key]);
      }
    });
  };
  addEye(raw.rightEye, 'Right eye');
  addEye(raw.leftEye, 'Left eye');
  if (raw.pd != null && text(raw.pd) !== '') values.PD = text(raw.pd);
  return values;
}

/** New writes are generic manual maps; historical shapes are preserved on read. */
function normalizePrescription(rawPrescription, { allowLegacy = false } = {}) {
  if (!rawPrescription) return undefined;
  const raw = toPlain(rawPrescription);
  // An empty Mongoose nested path can be truthy while serializing to
  // undefined. Treat it exactly like an omitted prescription.
  if (!raw || typeof raw !== 'object') return undefined;
  const values = { ...legacyPrescriptionValues(raw), ...valuesObject(raw.values) };
  if (raw.method === 'manual' || Object.keys(values).length > 0 || !allowLegacy) {
    return { method: 'manual', values };
  }
  return {
    method: raw.method,
    fileName: raw.fileName,
    values,
    leftEye: toPlain(raw.leftEye),
    rightEye: toPlain(raw.rightEye),
    pd: raw.pd,
  };
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
  }
  return value;
}

function fingerprintFor(lensOption, prescription) {
  const identity = {
    lens: lensOption ? {
      baseType: lensOption.baseType || lensOption.type,
      packageId: lensOption.packageId || '',
      type: lensOption.type,
    } : null,
    prescription: prescription || null,
  };
  return createHash('sha256').update(JSON.stringify(stableValue(identity))).digest('hex');
}

function canonicalFieldKey(value) {
  return text(value).toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function aliasesFor(field, eye) {
  const label = text(field.label);
  const key = text(field.key);
  if (!eye) return new Set([canonicalFieldKey(label), canonicalFieldKey(key)]);
  const title = eye === 'left' ? 'Left eye' : 'Right eye';
  return new Set([
    canonicalFieldKey(`${title} · ${label}`), canonicalFieldKey(`${title} · ${key}`),
    canonicalFieldKey(`${label}:${title}`), canonicalFieldKey(`${key}:${eye}`),
    canonicalFieldKey(`${eye}.${key}`), canonicalFieldKey(`${eye}Eye.${key}`),
  ]);
}

function findPrescriptionValue(values, field, eye) {
  const aliases = aliasesFor(field, eye);
  return Object.entries(values).find(([key]) => aliases.has(canonicalFieldKey(key)))?.[1];
}

function validateFieldValue(field, value, displayName) {
  if (value == null || text(value) === '') return;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) throw ApiError.badRequest(`${displayName} must be a number`);
  if (numeric < field.min || numeric > field.max) {
    throw ApiError.badRequest(`${displayName} must be between ${field.min} and ${field.max}`);
  }
  const steps = (numeric - field.min) / field.step;
  if (Math.abs(steps - Math.round(steps)) > 1e-7) {
    throw ApiError.badRequest(`${displayName} must use increments of ${field.step}`);
  }
}

function appliesToPowerType(item, powerType) {
  const refs = (item.powerTypes || []).map(lower);
  return refs.length === 0 || refs.includes('all') || refs.includes(lower(powerType));
}

function validateConfiguredPrescription(product, mode, prescription, { allowLegacy = false } = {}) {
  if (!mode.requiresPrescription) return undefined;
  if (allowLegacy && prescription && prescription.method !== 'manual') return prescription;
  const values = prescription?.values || {};
  const fields = (product.lensPrescriptionFields || []).filter(
    (field) => field.isActive !== false && appliesToPowerType(field, mode.type)
  );
  if (!Object.values(values).some((value) => text(value) !== '')) {
    throw ApiError.badRequest(`Prescription details are required for ${mode.label}`);
  }
  if (fields.length === 0) return prescription;
  fields.forEach((field) => {
    const eyes = field.scope === 'per-eye' ? ['right', 'left'] : [undefined];
    eyes.forEach((eye) => {
      const value = findPrescriptionValue(values, field, eye);
      const displayName = eye
        ? `${eye === 'right' ? 'Right eye' : 'Left eye'} · ${field.label}`
        : field.label;
      if (field.required !== false && (value == null || text(value) === '')) {
        throw ApiError.badRequest(`${displayName} is required`);
      }
      validateFieldValue(field, value, displayName);
    });
  });
  return prescription;
}

function findContactPowerValue(values, powerType, eye) {
  const aliases = new Set([
    canonicalFieldKey(`${powerType.name}:${eye}`),
    canonicalFieldKey(`${eye} · ${powerType.name}`),
    canonicalFieldKey(`${powerType.name}:${eye.replace(' eye', '')}`),
  ]);
  return Object.entries(values).find(([key]) => aliases.has(canonicalFieldKey(key)))?.[1];
}

function validateContactPrescription(contactLens, prescription) {
  const values = prescription?.values || {};
  if (!Object.values(values).some((value) => text(value) !== '')) {
    throw ApiError.badRequest('Prescription details are required for powered contact lenses');
  }
  const powerTypes = contactLens?.powerTypes || [];
  if (!powerTypes.length) return;

  let hasCompleteEye = false;
  ['Right eye', 'Left eye'].forEach((eye) => {
    let suppliedCount = 0;
    powerTypes.forEach((powerType) => {
      const value = findContactPowerValue(values, powerType, eye);
      if (value != null && text(value) !== '') {
        suppliedCount += 1;
        validateFieldValue(powerType, value, `${powerType.name} · ${eye}`);
      }
    });
    if (suppliedCount > 0 && suppliedCount < powerTypes.length) {
      throw ApiError.badRequest(`Enter every configured power value for ${eye}`);
    }
    if (suppliedCount === powerTypes.length) hasCompleteEye = true;
  });
  if (!hasCompleteEye) {
    throw ApiError.badRequest('Enter every configured power value for at least one eye');
  }
}

function selectionParts(rawLensOption) {
  const rawType = text(rawLensOption?.type);
  const separator = rawType.indexOf(':');
  return {
    baseType: text(rawLensOption?.baseType || (separator >= 0 ? rawType.slice(0, separator) : rawType)),
    packageId: text(rawLensOption?.packageId || (separator >= 0 ? rawType.slice(separator + 1) : '')),
  };
}

function resolveContactLensSelection(product, rawLensOption, rawPrescription, options) {
  const rawType = text(rawLensOption.type);
  const match = rawType.match(/^contact-(clear|color|solution|accessory)-(zero-power|with-power)-(\d+)-(\d+)$/);
  if (!match) throw ApiError.badRequest('Invalid contact lens selection');
  const kind = match[1];
  const requestedPowerType = match[2];
  const packIndex = Number(match[3]);
  const colourIndex = Number(match[4]);
  if (kind !== product.contactLens.kind) {
    throw ApiError.badRequest('Invalid contact lens product type');
  }
  // Solutions and accessories never carry optical power. Canonicalize stale
  // historical configurations instead of making their obsolete mode block a
  // valid purchase.
  const powerType = ['solution', 'accessory'].includes(kind) ? 'zero-power' : requestedPowerType;
  const configuredModes = product.contactLens?.powerModes || [];
  if (['clear', 'color'].includes(kind) && configuredModes.length && !configuredModes.includes(powerType)) {
    throw ApiError.badRequest('Selected contact lens power type is not available');
  }
  const packs = product.contactLens?.packOptions || [];
  const lensPackage = packs[packIndex];
  if ((packs.length && !lensPackage) || (!packs.length && packIndex !== 0)) {
    throw ApiError.badRequest('Selected contact lens pack is not available');
  }
  const colours = kind === 'color' ? product.contactLens?.availableColors || [] : [];
  const selectedColour = colours[colourIndex];
  if ((colours.length && !selectedColour) || (!colours.length && colourIndex !== 0)) {
    throw ApiError.badRequest('Selected contact lens colour is not available');
  }

  const prescription = normalizePrescription(rawPrescription, options);
  if (powerType === 'with-power' && !options.allowLegacy) {
    validateContactPrescription(product.contactLens, prescription);
  }
  const price = lensPackage?.price == null ? 0 : Math.max(0, Number(lensPackage.price) - Number(product.price));
  const mrp = lensPackage?.mrp == null ? price : Math.max(price, Number(lensPackage.mrp) - Number(product.mrp));
  const powerTypeLabel = kind === 'solution'
    ? 'Solution'
    : kind === 'accessory'
      ? 'Accessory'
      : powerType === 'with-power' ? 'With Power' : 'Zero Power';
  const packageId = lensPackage ? `contact-${packIndex}` : undefined;
  const packageName = lensPackage?.label;
  const canonicalType = `contact-${kind}-${powerType}-${packIndex}-${colourIndex}`;
  const lensOption = {
    type: canonicalType, baseType: powerType, powerTypeLabel, packageId, packageName,
    label: [powerTypeLabel, packageName].filter(Boolean).join(' · '),
    colour: selectedColour?.name,
    price, mrp, features: [], tags: [],
  };
  const keptPrescription = powerType === 'with-power' ? prescription : undefined;
  return {
    lensOption,
    prescription: keptPrescription,
    configurationFingerprint: fingerprintFor(lensOption, keptPrescription),
  };
}

/** Resolve a client selection to an authoritative, order-ready snapshot. */
export function resolveLensSelection(product, rawLensOption, rawPrescription, { allowLegacy = false } = {}) {
  // Mongoose may materialize an otherwise empty nested path because its price
  // and array members have defaults. No type still means "no lens selection".
  if (!rawLensOption || !text(rawLensOption.type)) {
    return {
      lensOption: undefined,
      prescription: undefined,
      configurationFingerprint: fingerprintFor(undefined, undefined),
    };
  }
  if (product.contactLens && text(rawLensOption.type).startsWith('contact-')) {
    return resolveContactLensSelection(product, rawLensOption, rawPrescription, { allowLegacy });
  }

  const { baseType, packageId } = selectionParts(rawLensOption);
  if (!baseType) throw ApiError.badRequest('Choose a power type');
  const configuredModes = product.lensOptions || [];
  const mode = configuredModes.find((item) => lower(item.type) === lower(baseType) && item.isActive !== false);
  if (configuredModes.length > 0 && !mode) throw ApiError.badRequest('Selected power type is not available');
  const inferredRequiresPrescription = !['zero-power', 'frame-only'].includes(baseType);
  const legacyMode = LEGACY_POWER_MODES[baseType] || { label: 'Lens', subtitle: '', price: 0 };
  const resolvedMode = mode
    ? {
        ...mode,
        requiresPrescription: typeof mode.requiresPrescription === 'boolean'
          ? mode.requiresPrescription
          : inferredRequiresPrescription,
      }
    : {
        type: baseType,
        label: legacyMode.label,
        subtitle: legacyMode.subtitle,
        badge: '',
        price: legacyMode.price,
        requiresPrescription: inferredRequiresPrescription,
      };

  const configuredPackages = product.lensPackages || [];
  const isFrameOnly = lower(resolvedMode.type) === 'frame-only';
  let lensPackage;
  // Frame-only is intrinsically package-less. Ignore a stale or malicious
  // package id so it can never add lens pricing or metadata to the snapshot.
  if (!isFrameOnly && configuredPackages.length > 0) {
    if (!packageId) throw ApiError.badRequest('Choose a lens package');
    if (packageId) {
      lensPackage = configuredPackages.find((item) => lower(item.id) === lower(packageId) && item.isActive !== false);
      if (!lensPackage) throw ApiError.badRequest('Selected lens package is not available');
      if (!appliesToPowerType(lensPackage, resolvedMode.type)) {
        throw ApiError.badRequest(`${lensPackage.name} is not available for ${resolvedMode.label}`);
      }
    }
  } else if (!isFrameOnly) {
    if (!packageId && !allowLegacy) throw ApiError.badRequest('Choose a lens package');
    if (packageId) {
      lensPackage = LEGACY_LENS_PACKAGES[lower(packageId)];
      if (!lensPackage) throw ApiError.badRequest('Selected lens package is not available');
    }
  }

  let prescription = normalizePrescription(rawPrescription, { allowLegacy });
  prescription = validateConfiguredPrescription(product, resolvedMode, prescription, { allowLegacy });
  if (!resolvedMode.requiresPrescription) prescription = undefined;

  const modePrice = Number(resolvedMode.price || 0);
  const packagePrice = Number(lensPackage?.price || 0);
  const packageMrp = Number(lensPackage?.mrp ?? packagePrice);
  const resolvedPackageId = lensPackage?.id;
  const packageName = lensPackage?.name;
  const lensOption = {
    type: resolvedPackageId ? `${resolvedMode.type}:${resolvedPackageId}` : resolvedMode.type,
    baseType: resolvedMode.type,
    powerTypeLabel: resolvedMode.label,
    packageId: resolvedPackageId,
    packageName,
    label: [resolvedMode.label, packageName].filter(Boolean).join(' · '),
    subtitle: lensPackage?.description || resolvedMode.subtitle,
    price: modePrice + packagePrice,
    mrp: modePrice + packageMrp,
    badge: lensPackage?.badge || resolvedMode.badge,
    image: lensPackage?.image,
    features: [...(lensPackage?.features || [])],
    warrantyMonths: lensPackage?.warrantyMonths,
    tags: [...(lensPackage?.tags || [])],
  };
  return {
    lensOption,
    prescription,
    configurationFingerprint: fingerprintFor(lensOption, prescription),
  };
}

async function getOrCreate(userId) {
  let cart = await cartRepository.findOne({ user: userId });
  if (!cart) cart = await cartRepository.create({ user: userId, items: [] });
  return cart;
}

function matchesLine(item, payload, configurationFingerprint, product) {
  let storedFingerprint = item.configurationFingerprint;
  if (!storedFingerprint) {
    storedFingerprint = resolveLensSelection(
      product,
      toPlain(item.lensOption),
      item.prescription,
      { allowLegacy: true }
    ).configurationFingerprint;
  }
  return String(item.product) === String(payload.productId)
    && String(item.variantId || '') === String(payload.variantId || '')
    && text(item.color) === text(payload.color)
    && storedFingerprint === configurationFingerprint;
}

/** Hydrate cart items with live product/configuration data and compute totals. */
async function hydrate(cart) {
  const ids = cart.items.map((item) => item.product);
  const products = await productRepository.find({ _id: { $in: ids } }, { populate: 'brand', lean: true });
  const map = Object.fromEntries(products.map((product) => [String(product._id), product]));
  const items = [];
  let removed = false;
  for (const item of cart.items) {
    const product = map[String(item.product)];
    if (!product || !product.isActive) {
      removed = true;
      continue;
    }
    const selection = resolveLensSelection(product, toPlain(item.lensOption), item.prescription, { allowLegacy: true });
    const lensPrice = selection.lensOption?.price || 0;
    const lensMrp = selection.lensOption?.mrp ?? lensPrice;
    const unitPrice = product.price + lensPrice;
    const unitMrp = product.mrp + lensMrp;
    items.push({
      _id: item._id,
      product: {
        _id: product._id, name: product.name, slug: product.slug,
        image: product.images?.[0], brand: product.brand?.name, stock: product.stock,
      },
      variantId: item.variantId,
      color: item.color,
      quantity: item.quantity,
      unitPrice,
      basePrice: product.price,
      baseMrp: product.mrp,
      mrp: unitMrp,
      lensOption: selection.lensOption,
      prescription: selection.prescription,
      lineTotal: unitPrice * item.quantity,
      inStock: product.stock >= item.quantity,
    });
  }
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const mrpTotal = items.reduce((sum, item) => sum + item.mrp * item.quantity, 0);
  return {
    items,
    summary: {
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      mrpTotal,
      savings: Math.max(0, mrpTotal - subtotal),
    },
    coupon: cart.coupon?.code ? cart.coupon : null,
    _removedUnavailable: removed,
  };
}

export const cartService = {
  async get(userId) {
    const cart = await getOrCreate(userId);
    return hydrate(cart);
  },

  async addItem(userId, payload) {
    const product = await productRepository.findById(payload.productId).lean();
    if (!product || !product.isActive) throw ApiError.notFound('Product not found');
    if (product.stock <= 0) throw ApiError.badRequest('This product is out of stock');
    const selection = resolveLensSelection(product, payload.lensOption, payload.prescription);
    const cart = await getOrCreate(userId);
    const existing = cart.items.find((item) => (
      matchesLine(item, payload, selection.configurationFingerprint, product)
    ));
    const quantity = payload.quantity || 1;
    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, product.stock);
      existing.lensOption = selection.lensOption;
      existing.prescription = selection.prescription;
      existing.configurationFingerprint = selection.configurationFingerprint;
    } else {
      cart.items.push({
        product: payload.productId,
        variantId: payload.variantId,
        color: payload.color,
        quantity: Math.min(quantity, product.stock),
        price: product.price,
        lensOption: selection.lensOption,
        prescription: selection.prescription,
        configurationFingerprint: selection.configurationFingerprint,
      });
    }
    await cart.save();
    return hydrate(cart);
  },

  async updateItem(userId, itemId, quantity) {
    const cart = await getOrCreate(userId);
    const item = cart.items.id(itemId);
    if (!item) throw ApiError.notFound('Cart item not found');
    if (quantity <= 0) item.deleteOne();
    else {
      const product = await productRepository.findById(item.product).lean();
      item.quantity = Math.min(quantity, product?.stock ?? quantity);
    }
    await cart.save();
    return hydrate(cart);
  },

  async removeItem(userId, itemId) {
    const cart = await getOrCreate(userId);
    const item = cart.items.id(itemId);
    if (item) item.deleteOne();
    await cart.save();
    return hydrate(cart);
  },

  async clear(userId) {
    const cart = await getOrCreate(userId);
    cart.items = [];
    cart.coupon = undefined;
    await cart.save();
    return hydrate(cart);
  },

  /** Merge a guest cart (from localStorage) into the user's server cart. */
  async merge(userId, guestItems = []) {
    if (!guestItems.length) return this.get(userId);
    const cart = await getOrCreate(userId);
    for (const guestItem of guestItems) {
      const product = await productRepository.findById(guestItem.productId).lean();
      if (!product || !product.isActive || product.stock <= 0) continue;
      const selection = resolveLensSelection(product, guestItem.lensOption, guestItem.prescription);
      const match = cart.items.find((item) => (
        matchesLine(item, guestItem, selection.configurationFingerprint, product)
      ));
      if (match) {
        match.quantity = Math.min(match.quantity + (guestItem.quantity || 1), product.stock);
        match.lensOption = selection.lensOption;
        match.prescription = selection.prescription;
        match.configurationFingerprint = selection.configurationFingerprint;
      } else {
        cart.items.push({
          product: guestItem.productId,
          variantId: guestItem.variantId,
          color: guestItem.color,
          quantity: Math.min(guestItem.quantity || 1, product.stock),
          price: product.price,
          lensOption: selection.lensOption,
          prescription: selection.prescription,
          configurationFingerprint: selection.configurationFingerprint,
        });
      }
    }
    await cart.save();
    return hydrate(cart);
  },
};

export default cartService;
