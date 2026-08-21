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
const configId = z
  .string()
  .trim()
  .min(1)
  .max(60)
  .regex(/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/, 'Use a lowercase ID containing letters, numbers, hyphens, or underscores');

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
  type: configId,
  label: z.string().trim().min(1).max(80),
  subtitle: z.string().trim().max(160).optional(),
  badge: z.string().trim().max(40).optional(),
  requiresPrescription: z.boolean().optional(),
  isActive: z.boolean().optional(),
  price: z.number().min(0).optional(),
});

const applicabilitySchema = z.array(z.union([configId, z.literal('all')])).min(1).max(12);

const lensPackageSchema = z.object({
  id: configId,
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(300).optional(),
  badge: z.string().trim().max(40).optional(),
  image: z.string().trim().max(2_000).optional(),
  features: z.array(z.string().trim().min(1).max(120)).max(12).optional(),
  warrantyMonths: z.number().int().min(0).max(120).optional(),
  price: z.number().min(0).optional(),
  mrp: z.number().min(0).optional(),
  tags: z.array(z.string().trim().min(1).max(50)).max(16).optional(),
  powerTypes: applicabilitySchema,
  isActive: z.boolean().optional(),
}).refine(({ price = 0, mrp }) => mrp == null || mrp >= price, {
  message: 'Lens package MRP cannot be less than price',
  path: ['mrp'],
});

const lensPrescriptionFieldSchema = z.object({
  key: configId,
  label: z.string().trim().min(1).max(80),
  min: z.number().min(-200).max(200),
  max: z.number().min(-200).max(200),
  step: z.number().min(0.001).max(400),
  scope: z.enum(['per-eye', 'shared']),
  required: z.boolean().optional(),
  powerTypes: applicabilitySchema,
  isActive: z.boolean().optional(),
}).refine(({ min, max }) => min <= max, {
  message: 'Maximum must be greater than or equal to minimum',
  path: ['max'],
}).refine(({ min, max, step }) => ((max - min) / step) + 1 <= 1_000, {
  message: 'Prescription range can contain no more than 1,000 choices',
  path: ['step'],
});

function validateLensConfiguration(
  data,
  ctx,
  { validateReferences = true, validateCompleteness = true } = {}
) {
  const collections = [
    ['lensOptions', data.lensOptions, 'type', 'Power type'],
    ['lensPackages', data.lensPackages, 'id', 'Lens package ID'],
    ['lensPrescriptionFields', data.lensPrescriptionFields, 'key', 'Prescription field key'],
  ];
  collections.forEach(([path, items, property, label]) => {
    if (!items) return;
    const values = items.map((item) => item[property].toLowerCase());
    if (new Set(values).size !== values.length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message: `${label} values must be unique` });
    }
  });

  const optionTypes = data.lensOptions
    ? new Set(data.lensOptions.map((option) => option.type.toLowerCase()))
    : null;
  [
    ['lensPackages', data.lensPackages],
    ['lensPrescriptionFields', data.lensPrescriptionFields],
  ].forEach(([path, items]) => {
    (items || []).forEach((item, index) => {
      const refs = item.powerTypes.map((value) => value.toLowerCase());
      if (refs.includes('all') && refs.length > 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [path, index, 'powerTypes'],
          message: '`all` cannot be combined with specific power types',
        });
      }
      if (new Set(refs).size !== refs.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [path, index, 'powerTypes'],
          message: 'Applicable power types must be unique',
        });
      }
      if (validateReferences && optionTypes) {
        const unknown = refs.find((ref) => ref !== 'all' && !optionTypes.has(ref));
        if (unknown) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [path, index, 'powerTypes'],
            message: `Unknown power type: ${unknown}`,
          });
        }
      }
    });
  });

  if (validateCompleteness && data.lensOptions?.length) {
    const activeOptions = data.lensOptions.filter((option) => option.isActive !== false);
    if (activeOptions.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['lensOptions'],
        message: 'Configure at least one active power type',
      });
    }
    const appliesTo = (item, powerType) => (
      item.powerTypes.includes('all') || item.powerTypes.includes(powerType)
    );
    activeOptions.forEach((option) => {
      if (option.type !== 'frame-only') {
        const hasPackage = (data.lensPackages || []).some(
          (lensPackage) => lensPackage.isActive !== false && appliesTo(lensPackage, option.type)
        );
        if (!hasPackage) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['lensPackages'],
            message: `Active power type ${option.label} needs an active compatible lens package`,
          });
        }
      }
      const requiresPrescription = typeof option.requiresPrescription === 'boolean'
        ? option.requiresPrescription
        : !['zero-power', 'frame-only'].includes(option.type);
      if (requiresPrescription) {
        const hasField = (data.lensPrescriptionFields || []).some(
          (field) => field.isActive !== false
            && field.required !== false
            && appliesTo(field, option.type)
        );
        if (!hasField) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['lensPrescriptionFields'],
            message: `Active power type ${option.label} needs an active compatible required prescription field`,
          });
        }
      }
    });
  }
}

const promotionSchema = z.object({
  heading: z.string().trim().min(2).max(60).optional(),
  title: z.string().trim().min(2).max(100),
  subtitle: z.string().trim().max(160).optional(),
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

const contactLensPowerTypeSchema = z.object({
  name: z.string().trim().min(1).max(40),
  min: z.number().min(-200).max(200),
  max: z.number().min(-200).max(200),
  step: z.number().min(0.01).max(200),
}).refine(({ min, max }) => min <= max, {
  message: 'Minimum power must be less than or equal to maximum power',
  path: ['max'],
}).refine(({ min, max, step }) => ((max - min) / step) + 1 <= 1000, {
  message: 'Power range can contain no more than 1,000 choices',
  path: ['step'],
});

const contactLensSchema = z.object({
  kind: z.enum(['clear', 'color', 'solution', 'accessory']),
  wearSchedule: z.string().trim().max(80).optional(),
  lensesPerBox: z.number().int().positive().optional(),
  powerModes: z.array(z.enum(['zero-power', 'with-power'])).min(1).max(2).optional(),
  powerTypes: z.array(contactLensPowerTypeSchema).max(12).optional(),
  prescriptionFields: z.array(z.string().trim().min(1).max(40)).max(12).optional(),
  sphericalPowerMin: z.number().min(-20).max(0).optional(),
  sphericalPowerMax: z.number().min(0).max(20).optional(),
  packOptions: z.array(contactLensPackOptionSchema).max(12).optional(),
  availableColors: z.array(contactLensColorSchema).max(20).optional(),
}).refine(({ powerTypes = [] }) => (
  new Set(powerTypes.map((item) => item.name.toLowerCase())).size === powerTypes.length
), {
  message: 'Power type names must be unique',
  path: ['powerTypes'],
});

const productBodyShape = {
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
    lensOptions: z.array(lensOptionSchema).max(12).optional(),
    lensPackages: z.array(lensPackageSchema).max(30).optional(),
    lensPrescriptionFields: z.array(lensPrescriptionFieldSchema).max(24).optional(),
    promotion: promotionSchema.nullable().optional(),
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
};

export const createProductSchema = {
  body: z.object(productBodyShape).superRefine((data, ctx) => validateLensConfiguration(data, ctx)),
};

// All fields optional on update.
export const updateProductSchema = {
  params: z.object({ id: objectId }),
  // Cross-array references are checked again against the complete Mongoose
  // document in Product's pre-validation hook. Here, validate references when
  // the update includes lensOptions, while still allowing one-array patches.
  body: z.object(productBodyShape).partial().superRefine((data, ctx) => (
    validateLensConfiguration(data, ctx, {
      validateReferences: Boolean(data.lensOptions),
      validateCompleteness: Boolean(
        data.lensOptions && data.lensPackages && data.lensPrescriptionFields
      ),
    })
  )),
};
