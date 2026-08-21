import { z } from 'zod';
import { PAYMENT_METHOD } from '../constants/index.js';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

const lensOption = z
  .object({
    type: z.string().trim().min(1),
    baseType: z.string().trim().min(1).optional(),
    powerTypeLabel: z.string().optional(),
    packageId: z.string().trim().min(1).optional(),
    packageName: z.string().optional(),
    colour: z.string().optional(),
    label: z.string().optional(),
    subtitle: z.string().optional(),
    price: z.number().min(0).optional(),
    mrp: z.number().min(0).optional(),
    badge: z.string().optional(),
    image: z.string().optional(),
    features: z.array(z.string()).optional(),
    warrantyMonths: z.number().min(0).optional(),
    tags: z.array(z.string()).optional(),
  })
  .optional();

const prescription = z
  .object({
    method: z.literal('manual').optional().default('manual'),
    values: z
      .record(z.union([z.string().max(100), z.number().finite()]))
      .refine((values) => Object.keys(values).length <= 100, 'Too many prescription values')
      .transform((values) => Object.fromEntries(
        Object.entries(values).map(([key, value]) => [key, String(value).trim()])
      )),
  })
  .optional();

export const addCartItemSchema = {
  body: z.object({
    productId: objectId,
    variantId: objectId.optional(),
    color: z.string().optional(),
    quantity: z.number().int().min(1).max(20).default(1),
    lensOption,
    prescription,
  }),
};

export const updateCartItemSchema = {
  params: z.object({ itemId: objectId }),
  body: z.object({ quantity: z.number().int().min(0).max(20) }),
};

export const itemIdParamSchema = { params: z.object({ itemId: objectId }) };

export const mergeCartSchema = {
  body: z.object({
    items: z
      .array(
        z.object({
          productId: objectId,
          variantId: objectId.optional(),
          color: z.string().optional(),
          quantity: z.number().int().min(1).optional(),
          lensOption,
          prescription,
        })
      )
      .default([]),
  }),
};

export const productIdParamSchema = { params: z.object({ productId: objectId }) };

export const toggleWishlistSchema = { body: z.object({ productId: objectId }) };
export const mergeWishlistSchema = { body: z.object({ productIds: z.array(objectId).default([]) }) };

export const validateCouponSchema = {
  body: z.object({ code: z.string().trim().min(1), subtotal: z.number().min(0) }),
};

const address = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(7),
  line1: z.string().min(3),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
  country: z.string().optional(),
});

export const quoteSchema = {
  body: z.object({
    couponCode: z.string().optional(),
    deliveryMethod: z.enum(['standard', 'express']).default('standard'),
  }),
};

export const createOrderSchema = {
  body: z.object({
    shippingAddress: address,
    deliveryMethod: z.enum(['standard', 'express']).default('standard'),
    couponCode: z.string().optional(),
    paymentMethod: z.enum(Object.values(PAYMENT_METHOD)),
    paymentToken: z.string().optional(),
  }),
};

export const orderNumberParamSchema = { params: z.object({ orderNumber: z.string().min(3) }) };
export const cancelOrderSchema = {
  params: z.object({ orderNumber: z.string().min(3) }),
  body: z.object({ reason: z.string().optional() }),
};
