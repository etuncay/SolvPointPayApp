import { z } from 'zod';
import type { CustomerNoteInput } from './types';

const PII_IN_TEXT = /\b\d{11}\b|\b(?:\d[ -]*?){13,19}\b/;
const MAX_NOTE_LENGTH = 500;

const noteInputSchema = z.object({
  customerNo: z.string().min(1, 'cn_customer_required'),
  noteText: z
    .string()
    .min(1, 'cn_text_required')
    .max(MAX_NOTE_LENGTH, 'cn_text_max')
    .refine((v) => !PII_IN_TEXT.test(v), { message: 'cn_text_pii' }),
  targetEntityType: z.enum(['IndividualCustomer', 'CorporateCustomer', 'Agent']),
  priorityLevel: z.enum(['Low', 'Medium', 'High', 'Critical']),
  displayLimit: z.number().int().positive('cn_limit_positive').nullable(),
  endDate: z.string().nullable(),
});

/** Spec §7 — not giriş doğrulaması */
export function validateCustomerNoteInput(input: CustomerNoteInput): string | null {
  const parsed = noteInputSchema.safeParse(input);
  if (!parsed.success) {
    return parsed.error.errors[0]?.message ?? 'cn_validation_failed';
  }
  if (input.endDate && !/^\d{4}-\d{2}-\d{2}$/.test(input.endDate)) {
    return 'cn_end_date_invalid';
  }
  return null;
}

export { MAX_NOTE_LENGTH };
