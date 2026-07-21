/**
 * Environment configuration with boot-time validation.
 *
 * The application refuses to start if the environment is misconfigured, so the
 * rest of the codebase can treat `env` as a fully-typed, always-valid object.
 */
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const schema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(5000),
    API_PREFIX: z.string().startsWith('/').default('/api/v1'),

    MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

    CLIENT_URL: z.string().min(1, 'CLIENT_URL is required'),

    JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 chars'),
    JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 chars'),
    JWT_ACCESS_EXPIRES: z.string().default('15m'),
    JWT_REFRESH_EXPIRES: z.string().default('7d'),
    BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(4).max(15).default(10),

    RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),

    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),

    UPLOAD_PROVIDER: z.enum(['mock', 'cloudinary']).default('mock'),
    PAYMENT_PROVIDER: z.enum(['mock', 'razorpay', 'stripe']).default('mock'),
    OTP_PROVIDER: z.enum(['mock', 'email', 'sms']).default('mock'),

    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),

    SEED_ADMIN_EMAIL: z.string().email().default('admin@onlinechasmewala.com'),
    SEED_ADMIN_PASSWORD: z.string().min(6).default('Admin@123'),
  })
  .superRefine((val, ctx) => {
    if (val.UPLOAD_PROVIDER === 'cloudinary') {
      for (const key of ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']) {
        if (!val[key]) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [key],
            message: `${key} is required when UPLOAD_PROVIDER=cloudinary`,
          });
        }
      }
    }
  });

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  • ${i.path.join('.') || '(root)'}: ${i.message}`)
    .join('\n');
  // eslint-disable-next-line no-console
  console.error(`\n❌ Invalid environment configuration:\n${issues}\n`);
  process.exit(1);
}

const raw = parsed.data;

/** Fully validated, immutable environment configuration. */
export const env = Object.freeze({
  ...raw,
  isProd: raw.NODE_ENV === 'production',
  isDev: raw.NODE_ENV === 'development',
  isTest: raw.NODE_ENV === 'test',
  corsOrigins: raw.CLIENT_URL.split(',').map((o) => o.trim()).filter(Boolean),
});

export default env;
