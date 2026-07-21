import { z } from 'zod';
import { PAYMENT_METHOD } from '../constants/index.js';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

const lensOption = z
  .object({
    type: z.string(),
    label: z.string().optional(),
    price: z.number().min(0).optional(),
  })
  .optional();

export const addCartItemSchema = {
  body: z.object({
    productId: objectId,
    variantId: objectId.optional(),
    color: z.string().optional(),
    quantity: z.number().int().min(1).max(20).default(1),
    lensOption,
    prescription: z.any().optional(),
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
