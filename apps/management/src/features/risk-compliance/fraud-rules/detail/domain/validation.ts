import { z } from 'zod';
import type { FraudRuleInput } from './types';

const inputSchema = z.object({
  title: z.string().trim().min(1, 'rs_title_required'),
  description: z.string(),
  scope: z.enum(['Onboarding', 'Remittance']),
  conditionDsl: z.string().trim().min(1, 'frd_dsl_required'),
  status: z.enum(['Active', 'Passive']),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
  regulationReference: z.string(),
  actionDetails: z.array(z.object({ type: z.string(), params: z.record(z.unknown()).optional() })).min(1),
  dslValidatedAt: z.string().nullable(),
});

export function validateFraudRuleInput(input: FraudRuleInput): { ok: true } | { ok: false; error: string } {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'frd_invalid' };
  }
  if (!input.dslValidatedAt) {
    return { ok: false, error: 'frd_dsl_not_validated' };
  }
  return { ok: true };
}
