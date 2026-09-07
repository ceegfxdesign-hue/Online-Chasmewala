import { z } from 'zod';
const id = z
  .string()
  .regex(/^[a-z0-9-]+$/)
  .max(60);
const text = z.string().trim().max(180);
const url = z
  .string()
  .max(1000)
  .refine(
    (v) => !v || /^https?:\/\//.test(v) || /^\/(?!\/)/.test(v),
    'Use an http(s) URL or local path'
  );
export const frameLensSchema = z
  .object({
    powerTypes: z
      .array(
        z.object({
          id,
          label: text.min(1),
          subtitle: text.optional(),
          price: z.number().min(0),
          badge: text.optional(),
          badgeColor: z.enum(['brand', 'navy', 'success', 'error', 'warning', 'accent']).optional(),
          icon: z.enum(['Eye', 'Monitor', 'Layers', 'Square', 'Sun', 'Shield']).optional(),
          iconBgColor: z.enum(['brand', 'purple', 'blue', 'grey', 'navy']).optional(),
          requiresPrescription: z.boolean(),
          autoAdvance: z.boolean().optional(),
          isActive: z.boolean(),
          order: z.number().int().optional(),
        })
      )
      .min(1)
      .max(12),
    packageCategories: z
      .array(z.object({ id, label: text.min(1), order: z.number().int(), isActive: z.boolean() }))
      .max(24)
      .optional(),
    packages: z
      .array(
        z.object({
          id,
          name: text.min(1),
          description: text.optional(),
          price: z.number().min(0),
          features: z.array(text.min(1)).max(20).optional(),
          badge: text.optional(),
          categories: z.array(id).max(24).optional(),
          powerTypes: z.array(id).max(12),
          imageUrl: url.optional(),
          isRecommended: z.boolean().optional(),
          isActive: z.boolean(),
          order: z.number().int().optional(),
        })
      )
      .max(24),
    prescriptionFields: z
      .array(
        z.object({
          key: id,
          label: text.min(1),
          min: z.number().min(-200).max(200),
          max: z.number().min(-200).max(200),
          step: z.number().min(0.01).max(200),
          scope: z.enum(['per-eye', 'shared']),
          required: z.boolean(),
          isActive: z.boolean(),
          powerTypes: z.array(id),
          fieldType: z.enum(['dropdown', 'number', 'text']).optional(),
          placeholder: text.optional(),
          helpText: text.optional(),
        })
      )
      .max(24),
    generalSettings: z
      .object({
        uiText: z.record(z.string().max(60), text).optional(),
        drawerTitle: text.min(1),
        stepLabels: z.array(text.min(1)).length(3),
        learnMoreUrl: url,
        showRunningTotal: z.boolean(),
        ctaText: text.min(1),
        noPrescriptionMessage: text.min(1),
        autoAdvance: z.boolean(),
      })
      .optional(),
  })
  .superRefine((v, ctx) => {
    const issue = (message) => ctx.addIssue({ code: 'custom', message });
    for (const group of ['powerTypes', 'packages', 'prescriptionFields', 'packageCategories']) {
      const ids = (v[group] || []).map((x) => x.id || x.key);
      if (new Set(ids).size !== ids.length) issue('IDs must be unique within ' + group);
    }
    const modes = new Set(v.powerTypes.map((x) => x.id)),
      cats = new Set((v.packageCategories || []).map((x) => x.id));
    for (const item of [...v.packages, ...v.prescriptionFields])
      if (item.powerTypes.some((x) => !modes.has(x))) issue('Unknown compatible power type');
    for (const item of v.packages)
      if (item.categories?.some((x) => !cats.has(x))) issue('Unknown package category');
    for (const f of v.prescriptionFields)
      if (f.min > f.max || (f.max - f.min) / f.step > 5000)
        issue('Invalid field range or more than 5000 choices');
  });
