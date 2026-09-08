import { z } from 'zod';
export const contactSchema = {
  body: z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(254),
    phone: z.string().trim().max(20).regex(/^[0-9+()\s-]*$/).optional(),
    subject: z.string().trim().min(3).max(150),
    message: z.string().trim().min(10).max(5000),
  }),
};
