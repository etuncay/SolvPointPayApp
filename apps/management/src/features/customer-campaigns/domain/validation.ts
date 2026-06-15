import { z } from 'zod';
import type { CampaignInput, CampaignUpdateInput } from './types';

const campaignFieldsSchema = z.object({
  name: z.string().min(1, 'ccm_name_required'),
  description: z.string(),
  fixedFeeGainRate: z.number().min(0, 'ccm_rate_min').max(1, 'ccm_rate_max'),
  commissionGainRate: z.number().min(0, 'ccm_rate_min').max(1, 'ccm_rate_max'),
  transactionType: z.enum([
    'WalletToPerson',
    'InternationalTransfer',
    'WalletToBankAccount',
    'WalletTopUp',
  ]),
  currency: z.enum(['TRY', 'USD', 'EUR']),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  minTxAmount: z.number().min(0).nullable(),
  maxGainPerTx: z.number().min(0).nullable(),
  maxGainTotal: z.number().min(0).nullable(),
  maxUsageCount: z.number().int().min(1).nullable(),
});

const dateRangeRefine = (v: { startDate: string | null; endDate: string | null }) => {
  if (!v.startDate || !v.endDate) return true;
  return v.endDate >= v.startDate;
};

const campaignBodySchema = campaignFieldsSchema.refine(dateRangeRefine, {
  message: 'ccm_date_range_invalid',
  path: ['endDate'],
});

const createSchema = campaignFieldsSchema
  .extend({
    campaignCode: z
      .string()
      .min(2, 'ccm_code_required')
      .regex(/^[A-Z0-9_]+$/, 'ccm_code_format'),
  })
  .refine(dateRangeRefine, { message: 'ccm_date_range_invalid', path: ['endDate'] });

/** Spec §7 — kampanya giriş doğrulaması */
export function validateCampaignInput(input: CampaignInput): string | null {
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) {
    return parsed.error.errors[0]?.message ?? 'ccm_validation_failed';
  }
  return validateDates(input.startDate, input.endDate);
}

export function validateCampaignUpdate(input: CampaignUpdateInput): string | null {
  const parsed = campaignBodySchema.safeParse(input);
  if (!parsed.success) {
    return parsed.error.errors[0]?.message ?? 'ccm_validation_failed';
  }
  return validateDates(input.startDate, input.endDate);
}

function validateDates(startDate: string | null, endDate: string | null): string | null {
  if (startDate && !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) return 'ccm_start_date_invalid';
  if (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) return 'ccm_end_date_invalid';
  return null;
}
