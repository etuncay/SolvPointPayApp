import { z } from 'zod';
import type { DocumentUploadPayload } from './types';

const relationSchema = z.object({
  relationType: z.enum(['Customer', 'Agent', 'Transaction', 'Complaint', 'Employee']),
  relatedId: z.string().trim().min(1, 'du_relation_id_required'),
});

const uploadSchema = z
  .object({
    category: z.string().min(1, 'du_category_required'),
    documentTypeId: z.string().min(1, 'du_type_required'),
    validFrom: z.string().optional(),
    validUntil: z.string().optional(),
    relations: z.array(relationSchema),
  })
  .superRefine((data, ctx) => {
    if (data.validFrom && data.validUntil && data.validFrom > data.validUntil) {
      ctx.addIssue({ code: 'custom', message: 'du_date_range', path: ['validUntil'] });
    }
  });

export function validateUploadFormValues(
  values: Omit<DocumentUploadPayload, 'file'>,
): { ok: true } | { ok: false; error: string } {
  const parsed = uploadSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'frd_invalid' };
  }
  return { ok: true };
}
