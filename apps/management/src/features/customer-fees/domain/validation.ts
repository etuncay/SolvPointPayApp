import { z } from 'zod';
import type { CustomerFeeInput } from './types';

const feeInputSchema = z
  .object({
    transactionType: z.enum([
      'WalletToPerson',
      'InternationalTransfer',
      'WalletToBankAccount',
      'WalletTopUp',
    ]),
    currency: z.enum(['TRY', 'USD', 'EUR']),
    lowerLimit: z.number().min(0, 'cfe_lower_limit_min'),
    fixedFee: z.number().min(0, 'cfe_fixed_fee_min'),
    variableFeePct: z.number().min(0, 'cfe_variable_fee_min'),
    startDate: z.string().nullable(),
    endDate: z.string().nullable(),
    sourceCountry: z.enum(['ALL', 'TUR', 'DEU', 'USA', 'GBR']),
    targetCountry: z.enum(['ALL', 'TUR', 'DEU', 'USA', 'GBR']),
  })
  .refine(
    (v) => {
      if (!v.startDate || !v.endDate) return true;
      return v.endDate >= v.startDate;
    },
    { message: 'cfe_date_range_invalid', path: ['endDate'] },
  );

/** Spec §7 — ücret giriş doğrulaması */
export function validateCustomerFeeInput(input: CustomerFeeInput): string | null {
  const parsed = feeInputSchema.safeParse(input);
  if (!parsed.success) {
    return parsed.error.errors[0]?.message ?? 'cn_validation_failed';
  }
  if (input.startDate && !/^\d{4}-\d{2}-\d{2}$/.test(input.startDate)) {
    return 'cfe_start_date_invalid';
  }
  if (input.endDate && !/^\d{4}-\d{2}-\d{2}$/.test(input.endDate)) {
    return 'cn_end_date_invalid';
  }
  return null;
}
