import mongoose from 'mongoose';
import slugify from 'slugify';
import {
  GENDERS,
  FRAME_SHAPES,
  FRAME_TYPES,
  FRAME_MATERIALS,
  LENS_TYPES,
  FACE_SHAPES,
  FRAME_SIZES,
} from '../constants/index.js';

const variantSchema = new mongoose.Schema(
  {
    color: { type: String, required: true },
    colorHex: { type: String },
    primaryColor: { type: String },
    primaryColorHex: { type: String },
    secondaryColor: { type: String },
    secondaryColorHex: { type: String },
    images: [{ type: String }],
    stock: { type: Number, default: 0, min: 0 },
    sku: { type: String },
  },
  { _id: true }
);

const lensOptionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      trim: true,
      match: [/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/, 'Power type must be a lowercase ID'],
    },
    label: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true },
    badge: { type: String, trim: true },
    // Undefined is meaningful for legacy records: the cart resolver infers
    // powered modes require a prescription except zero-power/frame-only.
    requiresPrescription: { type: Boolean },
    isActive: { type: Boolean, default: true },
    price: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const lensPackageSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      trim: true,
      match: [/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/, 'Lens package ID must be lowercase and URL-safe'],
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    badge: { type: String, trim: true },
    image: { type: String, trim: true },
    features: [{ type: String, trim: true }],
    warrantyMonths: { type: Number, min: 0, max: 120 },
    price: { type: Number, default: 0, min: 0 },
    mrp: { type: Number, min: 0 },
    tags: [{ type: String, trim: true }],
    // `all` applies this package to every power mode. Otherwise each value
    // references a lensOptions.type ID on the same product.
    powerTypes: [{ type: String, required: true, trim: true }],
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const lensPrescriptionFieldSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
      match: [/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/, 'Prescription field key must be lowercase and URL-safe'],
    },
    label: { type: String, required: true, trim: true },
    min: { type: Number, required: true, min: -200, max: 200 },
    max: { type: Number, required: true, min: -200, max: 200 },
    step: { type: Number, required: true, min: 0.001, max: 400 },
    scope: { type: String, enum: ['per-eye', 'shared'], required: true },
    required: { type: Boolean, default: true },
    powerTypes: [{ type: String, required: true, trim: true }],
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const promotionSchema = new mongoose.Schema(
  {
    heading: { type: String, trim: true },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true },
  },
  { _id: false }
);

const contactLensPackOptionSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    units: { type: Number, min: 1 },
    price: { type: Number, min: 0 },
    mrp: { type: Number, min: 0 },
  },
  { _id: false }
);

const contactLensColorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    hex: { type: String, trim: true },
    images: [{ type: String }],
  },
  { _id: false }
);

const contactLensPowerTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    min: { type: Number, required: true, min: -200, max: 200 },
    max: { type: Number, required: true, min: -200, max: 200 },
    step: { type: Number, required: true, min: 0.01, max: 200, default: 0.25 },
  },
  { _id: false }
);

const contactLensSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: ['clear', 'color', 'solution', 'accessory'], default: 'clear', index: true },
    wearSchedule: { type: String, trim: true },
    lensesPerBox: { type: Number, min: 1 },
    powerModes: [{ type: String, enum: ['zero-power', 'with-power'] }],
    powerTypes: [contactLensPowerTypeSchema],
    // Legacy fields are retained so products created before powerTypes remain
    // editable without a migration.
    prescriptionFields: [{ type: String, trim: true }],
    // Selected per product by the admin; values stay within the normal
    // customer-facing optical range.
    sphericalPowerMin: { type: Number, min: -20, max: 0 },
    sphericalPowerMax: { type: Number, min: 0, max: 20 },
    packOptions: [contactLensPackOptionSchema],
    availableColors: [contactLensColorSchema],
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    sku: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    highlights: [{ type: String }],

    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, default: 0, index: true },

    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true, index: true },

    images: [{ type: String, required: true }],
    variants: [variantSchema],

    // Eyewear attributes (also power the filter facets)
    // `gender` remains the primary, legacy-compatible value. `genders` lets
    // one product be intentionally listed for more than one customer group.
    gender: { type: String, enum: GENDERS, default: 'unisex', index: true },
    genders: [{ type: String, enum: GENDERS, index: true }],
    frameShape: { type: String, enum: FRAME_SHAPES, index: true },
    frameType: { type: String, enum: FRAME_TYPES, index: true },
    frameMaterial: { type: String, enum: FRAME_MATERIALS, index: true },
    frameColor: { type: String },
    frameWidth: { type: Number }, // total width in mm
    frameSize: { type: String, enum: FRAME_SIZES, default: 'medium' },
    rimType: { type: String, enum: FRAME_TYPES },
    templeSize: { type: Number }, // mm
    bridgeSize: { type: Number }, // mm (nose bridge)
    lensWidth: { type: Number }, // mm
    lensType: { type: String, enum: LENS_TYPES, index: true },
    lensThickness: { type: String },
    lensOptions: [lensOptionSchema],
    lensPackages: [lensPackageSchema],
    lensPrescriptionFields: [lensPrescriptionFieldSchema],
    // Optional product-specific promotion shown on the detail page.
    promotion: { type: promotionSchema, default: undefined },
    // Contact-lens-specific configuration. This is only used for products in
    // the contact-lenses category and keeps clear, colour, solution and case
    // products in the same catalogue/order pipeline.
    contactLens: { type: contactLensSchema, default: undefined },
    suitableFaceShapes: [{ type: String, enum: FACE_SHAPES }],
    // Optional assets retained for future virtual try-on and 3D viewing.
    tryOnImage: { type: String },
    model3dUrl: { type: String },

    // Feature flags for lenses
    blueLightFilter: { type: Boolean, default: false, index: true },
    polarized: { type: Boolean, default: false, index: true },
    uvProtection: { type: Boolean, default: false, index: true },
    powered: { type: Boolean, default: true }, // supports prescription

    stock: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5 },

    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },

    warrantyMonths: { type: Number, default: 12 },
    returnDays: { type: Number, default: 14 },
    shippingMessage: { type: String, trim: true, default: '' },
    returnMessage: { type: String, trim: true, default: '' },
    warrantyMessage: { type: String, trim: true, default: '' },

    tags: [{ type: String, index: true }],
    collections: [{ type: String }], // e.g. 'summer-2026'

    isActive: { type: Boolean, default: true, index: true },
    isBestSeller: { type: Boolean, default: false, index: true },
    isTrending: { type: Boolean, default: false, index: true },
    isNewArrival: { type: Boolean, default: false, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Text index powering search by name/description/tags/SKU.
productSchema.index({ name: 'text', description: 'text', tags: 'text', sku: 'text' });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });

productSchema.virtual('inStock').get(function inStock() {
  return this.stock > 0;
});

/** Validate references and constraints that span the three lens config arrays. */
productSchema.pre('validate', function validateLensConfiguration(next) {
  const options = this.lensOptions || [];
  const packages = this.lensPackages || [];
  const fields = this.lensPrescriptionFields || [];
  const optionTypes = new Set(options.map((option) => String(option.type).toLowerCase()));

  const invalidateDuplicates = (items, property, path, label) => {
    const values = items.map((item) => String(item[property] || '').toLowerCase());
    if (new Set(values).size !== values.length) {
      this.invalidate(path, `${label} values must be unique`);
    }
  };

  const validateApplicability = (items, path) => {
    items.forEach((item, index) => {
      const refs = (item.powerTypes || []).map((value) => String(value).toLowerCase());
      if (refs.length === 0) {
        this.invalidate(`${path}.${index}.powerTypes`, 'Choose at least one applicable power type');
      }
      if (refs.includes('all') && refs.length > 1) {
        this.invalidate(`${path}.${index}.powerTypes`, '`all` cannot be combined with specific power types');
      }
      if (new Set(refs).size !== refs.length) {
        this.invalidate(`${path}.${index}.powerTypes`, 'Applicable power types must be unique');
      }
      refs.filter((ref) => ref !== 'all').forEach((ref) => {
        if (!optionTypes.has(ref)) {
          this.invalidate(`${path}.${index}.powerTypes`, `Unknown power type: ${ref}`);
        }
      });
    });
  };

  invalidateDuplicates(options, 'type', 'lensOptions', 'Power type');
  invalidateDuplicates(packages, 'id', 'lensPackages', 'Lens package ID');
  invalidateDuplicates(fields, 'key', 'lensPrescriptionFields', 'Prescription field key');
  validateApplicability(packages, 'lensPackages');
  validateApplicability(fields, 'lensPrescriptionFields');

  // Once power modes are configured, the active customer flow must be
  // complete. Products with no lensOptions remain untouched for compatibility.
  if (options.length > 0) {
    const activeOptions = options.filter((option) => option.isActive !== false);
    if (activeOptions.length === 0) {
      this.invalidate('lensOptions', 'Configure at least one active power type');
    }
    const appliesTo = (item, powerType) => {
      const refs = (item.powerTypes || []).map((value) => String(value).toLowerCase());
      return refs.includes('all') || refs.includes(powerType);
    };
    activeOptions.forEach((option, index) => {
      const powerType = String(option.type).toLowerCase();
      if (powerType !== 'frame-only') {
        const hasPackage = packages.some(
          (lensPackage) => lensPackage.isActive !== false && appliesTo(lensPackage, powerType)
        );
        if (!hasPackage) {
          this.invalidate(
            `lensOptions.${index}.type`,
            `Active power type ${option.label} needs an active compatible lens package`
          );
        }
      }
      const requiresPrescription = typeof option.requiresPrescription === 'boolean'
        ? option.requiresPrescription
        : !['zero-power', 'frame-only'].includes(powerType);
      if (requiresPrescription) {
        const hasField = fields.some(
          (field) => field.isActive !== false && field.required !== false && appliesTo(field, powerType)
        );
        if (!hasField) {
          this.invalidate(
            `lensOptions.${index}.requiresPrescription`,
            `Active power type ${option.label} needs an active compatible required prescription field`
          );
        }
      }
    });
  }

  packages.forEach((lensPackage, index) => {
    if (lensPackage.mrp != null && lensPackage.mrp < lensPackage.price) {
      this.invalidate(`lensPackages.${index}.mrp`, 'Lens package MRP cannot be less than price');
    }
  });
  fields.forEach((field, index) => {
    if (field.min > field.max) {
      this.invalidate(`lensPrescriptionFields.${index}.max`, 'Maximum must be greater than or equal to minimum');
    } else if (((field.max - field.min) / field.step) + 1 > 1000) {
      this.invalidate(`lensPrescriptionFields.${index}.step`, 'Prescription range can contain no more than 1,000 choices');
    }
  });

  next();
});

/** Keep the stored discountPercent in sync with price/mrp for sorting & display. */
productSchema.pre('save', function computeDiscount(next) {
  this.discountPercent =
    this.mrp && this.mrp > this.price ? Math.round(((this.mrp - this.price) / this.mrp) * 100) : 0;
  next();
});

productSchema.pre('validate', function setSlug(next) {
  if (this.isModified('name') || !this.slug) {
    const base = slugify(this.name, { lower: true, strict: true });
    // Append a short SKU suffix to guarantee uniqueness across similar names.
    this.slug = this.sku ? `${base}-${this.sku.toLowerCase()}` : base;
  }
  next();
});

export const Product = mongoose.model('Product', productSchema);
export default Product;
