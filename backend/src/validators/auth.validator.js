import { z } from 'zod';
import { passwordSchema as password } from './password.js';

const email = z.string().trim().toLowerCase().email('A valid email is required');

export const registerSchema = {
  body: z.object({
    name: z.string().trim().min(2, 'Name is required').max(60),
    email,
    password,
    phone: z
      .string()
      .trim()
      .regex(/^[0-9+\-\s]{7,15}$/, 'Enter a valid phone number')
      .optional(),
  }),
};

export const loginSchema = {
  body: z.object({
    email,
    password: z.string().min(1, 'Password is required'),
  }),
};

export const requestOtpSchema = {
  body: z.object({
    email,
    purpose: z.enum(['verification', 'reset']).default('verification'),
  }),
};

export const verifyOtpSchema = {
  body: z.object({
    email,
    code: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits'),
    newPassword: password.optional(),
  }),
};
