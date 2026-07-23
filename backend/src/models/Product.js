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
    images: [{ type: String }],
    stock: { type: Number, default: 0, min: 0 },
    sku: { type: String },
  },
  { _id: true }
);

const lensOptionSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    label: { type: String, required: true },
    subtitle: { type: String },
    price: { type: Number, default: 0, min: 0 },
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
    gender: { type: String, enum: GENDERS, default: 'unisex', index: true },
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
    suitableFaceShapes: [{ type: String, enum: FACE_SHAPES }],

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
