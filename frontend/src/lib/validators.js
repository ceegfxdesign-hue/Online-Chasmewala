/**
 * Shared Zod schemas for forms (React Hook Form + zodResolver-compatible via a
 * thin resolver in each form). Mirrors backend validation rules.
 */
import { z } from 'zod';

export const emailSchema = z.string().trim().min(1, 'Email is required').email('Enter a valid email');
export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(72, 'Password is too long');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
});

export const signupSchema = z
  .object({
    name: z.string().trim().min(2, 'Please enter your name').max(60),
    email: emailSchema,
    phone: z
      .string()
      .trim()
      .regex(/^[0-9+\-\s]{7,15}$/, 'Enter a valid phone number')
      .optional()
      .or(z.literal('')),
    password: passwordSchema,
    confirmPassword: z.string(),
    terms: z.literal(true, { errorMap: () => ({ message: 'Please accept the terms to continue' }) }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export const forgotSchema = z.object({ email: emailSchema });

export const otpSchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code'),
});

export const resetSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

/**
 * Minimal RHF resolver for a Zod schema (avoids adding @hookform/resolvers).
 * @param {import('zod').ZodTypeAny} schema
 */
export const zodResolver = (schema) => async (values) => {
  const result = schema.safeParse(values);
  if (result.success) return { values: result.data, errors: {} };
  const errors = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join('.');
    if (!errors[key]) errors[key] = { type: issue.code, message: issue.message };
  }
  return { values: {}, errors };
};
