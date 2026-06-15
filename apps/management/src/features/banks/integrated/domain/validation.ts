import { z } from 'zod';

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const integratedBankInputSchema = z.object({
  bankName: z.string().trim().min(1, 'ib_name_required'),
  service: z.string().trim().min(1, 'ib_service_required'),
  eftStartTime: z
    .string()
    .nullable()
    .refine((v) => v == null || v === '' || timeRegex.test(v), 'ib_time_invalid'),
  eftEndTime: z
    .string()
    .nullable()
    .refine((v) => v == null || v === '' || timeRegex.test(v), 'ib_time_invalid'),
  isDefaultEft: z.boolean(),
  hasIbanCheck: z.boolean(),
  isDefaultIbanCheck: z.boolean(),
  hasFast: z.boolean(),
  isDefaultFast: z.boolean(),
  reconciliationFeeApplied: z.boolean(),
});

export type IntegratedBankInputSchema = z.infer<typeof integratedBankInputSchema>;

export function validateIntegratedBankInput(input: unknown): { ok: true; data: IntegratedBankInputSchema } | { ok: false; error: string } {
  const parsed = integratedBankInputSchema.safeParse(input);
  if (!parsed.success) {
    const code = parsed.error.issues[0]?.message ?? 'ib_validation_failed';
    return { ok: false, error: code };
  }
  const data = {
    ...parsed.data,
    eftStartTime: parsed.data.eftStartTime?.trim() || null,
    eftEndTime: parsed.data.eftEndTime?.trim() || null,
  };
  return { ok: true, data };
}
