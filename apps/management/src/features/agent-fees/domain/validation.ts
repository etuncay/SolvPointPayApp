import { z } from 'zod';
import type { AgentFeeInput } from './types';

const feeInputSchema = z
  .object({
    groupCode: z
      .string()
      .min(2, 'agg_code_required')
      .regex(/^[A-Z0-9_]+$/, 'afee_group_format'),
    transactionType: z.enum([
      'WalletToPerson',
      'InternationalTransfer',
      'WalletToBankAccount',
      'WalletTopUp',
    ]),
    currency: z.enum(['TRY', 'USD', 'EUR']),
    lowerLimit: z.number().min(0, 'afee_lower_limit_min'),
    fixedFee: z.number().min(0, 'cfe_fixed_fee_min'),
    variableFeePct: z.number().min(0, 'cfe_variable_fee_min'),
    startDate: z.string().nullable(),
    endDate: z.string().nullable(),
  })
  .refine(
    (v) => {
      if (!v.startDate || !v.endDate) return true;
      return v.endDate >= v.startDate;
    },
    { message: 'cfe_date_range_invalid', path: ['endDate'] },
  );

const updateBodySchema = z
  .object({
    fixedFee: z.number().min(0, 'cfe_fixed_fee_min'),
    variableFeePct: z.number().min(0, 'cfe_variable_fee_min'),
    startDate: z.string().nullable(),
    endDate: z.string().nullable(),
  })
  .refine(
    (v) => {
      if (!v.startDate || !v.endDate) return true;
      return v.endDate >= v.startDate;
    },
    { message: 'cfe_date_range_invalid', path: ['endDate'] },
  );

/** Spec §7 — ücret giriş doğrulaması */
export function validateAgentFeeInput(input: AgentFeeInput): string | null {
  const parsed = feeInputSchema.safeParse({ ...input, groupCode: input.groupCode.toUpperCase() });
  if (!parsed.success) {
    return parsed.error.errors[0]?.message ?? 'ib_validation_failed';
  }
  if (input.startDate && !/^\d{4}-\d{2}-\d{2}$/.test(input.startDate)) {
    return 'cfe_start_date_invalid';
  }
  if (input.endDate && !/^\d{4}-\d{2}-\d{2}$/.test(input.endDate)) {
    return 'cn_end_date_invalid';
  }
  return null;
}

export function validateAgentFeeUpdate(
  input: Pick<AgentFeeInput, 'fixedFee' | 'variableFeePct' | 'startDate' | 'endDate'>,
): string | null {
  const parsed = updateBodySchema.safeParse(input);
  if (!parsed.success) {
    return parsed.error.errors[0]?.message ?? 'ib_validation_failed';
  }
  if (input.startDate && !/^\d{4}-\d{2}-\d{2}$/.test(input.startDate)) {
    return 'cfe_start_date_invalid';
  }
  if (input.endDate && !/^\d{4}-\d{2}-\d{2}$/.test(input.endDate)) {
    return 'cn_end_date_invalid';
  }
  return null;
}
