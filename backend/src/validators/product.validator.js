import { z } from 'zod';
import {
  GENDERS,
  FRAME_SHAPES,
  FRAME_TYPES,
  FRAME_MATERIALS,
  FRAME_SIZES,
  LENS_TYPES,
  FACE_SHAPES,
  RIM_TYPES,
} from '../constants/index.js';

const csv = z
  .string()
  .transform((s) => s.split(',').map((v) => v.trim()).filter(Boolean))
  .optional();

const boolish = z
  .union([z.literal('true'), z.literal('false'), z.boolean()])
  .transform((v) => v === true || v === 'true')
  .optional();

export const listProductsSchema = {
  query: z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(60).optional(),
    search: z.string().trim().optional(),
    category: z.string().trim().optional(), // slug or id (comma-separated slugs allowed)
    brand: z.string().trim().optional(), // slug(s), comma-separated
    gender: z.string().trim().optional(),
    frameShape: z.string().trim().optional(),
    frameType: z.string().trim().optional(),
    frameMaterial: z.string().trim().optional(),
    lensType: z.string().trim().optional(),
    faceShape: z.enum(FACE_SHAPES).optional(),
    color: z.string().trim().optional(),
    frameSize: z.string().trim().optional(),
    rimType: z.string().trim().optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    minRating: z.coerce.number().min(0).max(5).optional(),
    blueLightFilter: boolish,
    polarized: boolish,
    uvProtection: boolish,
    inStock: boolish,
    onOffer: boolish,
    tags: csv,
    sort: z
      .enum(['relevance', 'newest', 'price-asc', 'price-desc', 'rating', 'popular', 'discount'])
      .optional(),
  }),
};

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const slugParamSchema = {
  params: z.object({ slug: z.string().trim().min(1) }),
};

export const idParamSchema = {
  params: z.object({ id: objectId }),
};

const variantSchema = z.object({
  color: z.string().min(1),
  colorHex: z.string().optional(),
  primaryColor: z.string().trim().optional(),
  primaryColorHex: z.string().trim().optional(),
  secondaryColor: z.string().trim().optional(),
  secondaryColorHex: z.string().trim().optional(),
  images: z.array(z.string()).optional(),
  stock: z.number().int().min(0).optional(),
  sku: z.string().optional(),
});

const lensOptionSchema = z.object({
  type: z.string().trim().min(1),
  label: z.string().trim().min(1),
  subtitle: z.string().trim().optional(),
  price: z.number().min(0).optional(),
});

const contactLensPackOptionSchema = z.object({
  label: z.string().trim().min(1).max(60),
  units: z.number().int().positive().optional(),
  price: z.number().min(0).optional(),
  mrp: z.number().min(0).optional(),
});

const contactLensColorSchema = z.object({
  name: z.string().trim().min(1).max(60),
  hex: z.string().trim().max(20).optional(),
  images: z.array(z.string()).max(5).optional(),
});

const contactLensSchema = z.object({
  kind: z.enum(['clear', 'color', 'solution', 'accessory']),
  wearSchedule: z.string().trim().max(80).optional(),
  lensesPerBox: z.number().int().positive().optional(),
  powerModes: z.array(z.enum(['zero-power', 'with-power'])).min(1).max(2).optional(),
  prescriptionFields: z.array(z.string().trim().min(1).max(40)).max(8).optional(),
  sphericalPowerMin: z.number().min(-20).max(0).optional(),
  sphericalPowerMax: z.number().min(0).max(20).optional(),
  packOptions: z.array(contactLensPackOptionSchema).max(12).optional(),
  availableColors: z.array(contactLensColorSchema).max(20).optional(),
});

export const createProductSchema = {
  body: z.object({
    name: z.string().trim().min(2),
    sku: z.string().trim().min(1),
    description: z.string().trim().min(10),
    highlights: z.array(z.string()).optional(),
    price: z.number().min(0),
    mrp: z.number().min(0),
    category: objectId,
    brand: objectId,
    images: z.array(z.string()).min(1, 'At least one image is required'),
    variants: z.array(variantSchema).optional(),
    gender: z.enum(GENDERS).optional(),
    genders: z.array(z.enum(GENDERS)).min(1).max(GENDERS.length).optional(),
    frameShape: z.enum(FRAME_SHAPES).optional(),
    frameType: z.enum(FRAME_TYPES).optional(),
    frameMaterial: z.enum(FRAME_MATERIALS).optional(),
    frameColor: z.string().trim().optional(),
    frameSize: z.enum(FRAME_SIZES).optional(),
    rimType: z.enum(RIM_TYPES).optional(),
    lensType: z.enum(LENS_TYPES).optional(),
    lensThickness: z.string().trim().optional(),
    lensOptions: z.array(lensOptionSchema).optional(),
    contactLens: contactLensSchema.optional(),
    suitableFaceShapes: z.array(z.enum(FACE_SHAPES)).optional(),
    tryOnImage: z.string().trim().optional(),
    model3dUrl: z.string().trim().optional(),
    frameWidth: z.number().optional(),
    templeSize: z.number().optional(),
    bridgeSize: z.number().optional(),
    lensWidth: z.number().optional(),
    blueLightFilter: z.boolean().optional(),
    polarized: z.boolean().optional(),
    uvProtection: z.boolean().optional(),
    powered: z.boolean().optional(),
    stock: z.number().int().min(0).optional(),
    lowStockThreshold: z.number().int().min(0).optional(),
    rating: z.number().min(0).max(5).optional(),
    numReviews: z.number().int().min(0).optional(),
    soldCount: z.number().int().min(0).optional(),
    warrantyMonths: z.number().int().min(0).optional(),
    returnDays: z.number().int().min(0).optional(),
    shippingMessage: z.string().trim().max(80).optional(),
    returnMessage: z.string().trim().max(80).optional(),
    warrantyMessage: z.string().trim().max(80).optional(),
    tags: z.array(z.string()).optional(),
    collections: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
    isBestSeller: z.boolean().optional(),
    isTrending: z.boolean().optional(),
    isNewArrival: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
  }),
};

// All fields optional on update.
export const updateProductSchema = {
  params: z.object({ id: objectId }),
  body: createProductSchema.body.partial(),
};
