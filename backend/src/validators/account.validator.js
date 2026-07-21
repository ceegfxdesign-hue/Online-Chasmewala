import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');
export const idParam = { params: z.object({ id: objectId }) };

export const updateProfileSchema = {
  body: z.object({
    name: z.string().trim().min(2).max(60).optional(),
    phone: z
      .string()
      .trim()
      .regex(/^[0-9+\-\s]{7,15}$/, 'Enter a valid phone number')
      .optional()
      .or(z.literal('')),
    avatar: z.string().optional(),
    preferences: z
      .object({
        newsletter: z.boolean().optional(),
        orderUpdates: z.boolean().optional(),
      })
      .optional(),
  }),
};

export const changePasswordSchema = {
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters').max(72),
  }),
};

const addressBody = z.object({
  label: z.string().optional(),
  fullName: z.string().min(2),
  phone: z.string().min(7),
  line1: z.string().min(3),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
  country: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export const addAddressSchema = { body: addressBody };
export const updateAddressSchema = { params: z.object({ id: objectId }), body: addressBody.partial() };

export const addCardSchema = {
  body: z.object({
    number: z.string().regex(/^[\d\s]{12,19}$/, 'Enter a valid card number'),
    brand: z.string().optional(),
    expiryMonth: z.number().int().min(1).max(12),
    expiryYear: z.number().int().min(2024).max(2050),
    holderName: z.string().min(2),
    isDefault: z.boolean().optional(),
  }),
};

export const createReviewSchema = {
  params: z.object({ slug: z.string().min(1) }),
  body: z.object({
    rating: z.number().int().min(1).max(5),
    title: z.string().trim().max(100).optional(),
    comment: z.string().trim().min(5, 'Please write at least a few words'),
    images: z.array(z.string()).max(4).optional(),
  }),
};

export const createReturnSchema = {
  body: z.object({
    orderNumber: z.string().min(3),
    type: z.enum(['return', 'exchange']).default('return'),
    reason: z.string().min(3, 'Please tell us why'),
    comment: z.string().optional(),
    items: z
      .array(z.object({ product: objectId, quantity: z.number().int().min(1), reason: z.string().optional() }))
      .optional(),
    exchangeFor: z.object({ product: objectId, color: z.string().optional() }).optional(),
  }),
};

export const returnNumberParam = { params: z.object({ returnNumber: z.string().min(3) }) };
