import { z } from 'zod';
import {
  ORDER_STATUS,
  RETURN_STATUS,
  REVIEW_STATUS,
  COUPON_TYPE,
  ROLES,
} from '../constants/index.js';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');
export const idParam = { params: z.object({ id: objectId }) };

export const updateOrderStatusSchema = {
  params: z.object({ id: objectId }),
  body: z.object({
    status: z.enum(Object.values(ORDER_STATUS)),
    note: z.string().optional(),
  }),
};

export const updateReturnStatusSchema = {
  params: z.object({ id: objectId }),
  body: z.object({
    status: z.enum(Object.values(RETURN_STATUS)),
    note: z.string().optional(),
  }),
};

export const moderateReviewSchema = {
  params: z.object({ id: objectId }),
  body: z.object({ status: z.enum(Object.values(REVIEW_STATUS)) }),
};

export const createCouponSchema = {
  body: z.object({
    code: z.string().trim().min(3).max(20),
    description: z.string().trim().optional(),
    type: z.enum(Object.values(COUPON_TYPE)),
    value: z.number().positive(),
    maxDiscount: z.number().positive().optional(),
    minOrderValue: z.number().min(0).optional(),
    usageLimit: z.number().int().positive().optional(),
    perUserLimit: z.number().int().positive().optional(),
    startsAt: z.coerce.date().optional(),
    expiresAt: z.coerce.date(),
    isActive: z.boolean().optional(),
  }),
};

export const updateCouponSchema = {
  params: z.object({ id: objectId }),
  body: createCouponSchema.body.partial(),
};

export const createBannerSchema = {
  body: z.object({
    title: z.string().trim().min(1),
    subtitle: z.string().optional(),
    image: z.string().min(1),
    mobileImage: z.string().optional(),
    ctaLabel: z.string().optional(),
    ctaLink: z.string().optional(),
    placement: z.enum(['hero', 'secondary', 'strip', 'category']).optional(),
    theme: z.enum(['light', 'dark']).optional(),
    order: z.number().int().optional(),
    startsAt: z.coerce.date().optional(),
    expiresAt: z.coerce.date().optional(),
    isActive: z.boolean().optional(),
  }),
};

export const updateBannerSchema = {
  params: z.object({ id: objectId }),
  body: createBannerSchema.body.partial(),
};

export const setUserActiveSchema = {
  params: z.object({ id: objectId }),
  body: z.object({ isActive: z.boolean() }),
};

export const setUserRoleSchema = {
  params: z.object({ id: objectId }),
  body: z.object({ role: z.enum(Object.values(ROLES)) }),
};

export const updateSettingsSchema = {
  body: z.object({
    storeName: z.string().trim().min(1).optional(),
    supportEmail: z.string().email().optional(),
    supportPhone: z.string().trim().min(3).optional(),
    currency: z.string().trim().length(3).optional(),
    freeShippingThreshold: z.number().min(0).optional(),
    standardShippingFee: z.number().min(0).optional(),
    expressShippingFee: z.number().min(0).optional(),
    taxPercent: z.number().min(0).max(100).optional(),
    announcement: z.string().trim().max(300).optional(),
    socialLinks: z
      .object({
        instagram: z.string().url().or(z.literal('')).optional(),
        facebook: z.string().url().or(z.literal('')).optional(),
        twitter: z.string().url().or(z.literal('')).optional(),
        youtube: z.string().url().or(z.literal('')).optional(),
      })
      .optional(),
  }),
};
