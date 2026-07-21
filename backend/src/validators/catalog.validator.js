import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const idParamSchema = { params: z.object({ id: objectId }) };
export const slugParamSchema = { params: z.object({ slug: z.string().trim().min(1) }) };

export const createCategorySchema = {
  body: z.object({
    name: z.string().trim().min(2),
    description: z.string().trim().optional(),
    image: z.string().optional(),
    icon: z.string().optional(),
    parent: objectId.nullable().optional(),
    order: z.number().int().optional(),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
  }),
};

export const updateCategorySchema = {
  params: z.object({ id: objectId }),
  body: createCategorySchema.body.partial(),
};

export const createBrandSchema = {
  body: z.object({
    name: z.string().trim().min(2),
    logo: z.string().optional(),
    description: z.string().trim().optional(),
    isFeatured: z.boolean().optional(),
    isActive: z.boolean().optional(),
    order: z.number().int().optional(),
  }),
};

export const updateBrandSchema = {
  params: z.object({ id: objectId }),
  body: createBrandSchema.body.partial(),
};
