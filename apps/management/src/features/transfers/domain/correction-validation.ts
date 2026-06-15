import { z } from 'zod';
import { CORRECTION_REASONS } from './correction-types';

export const correctionFormSchema = z.object({
  complaintId: z.string(),
  sourceTransactionNo: z.string(),
  sourceCustomerId: z.number().nullable(),
  sourceWalletId: z.number().nullable(),
  targetCustomerId: z.number().nullable(),
  targetWalletId: z.number().nullable(),
  requestedAmount: z.number().positive('cr_amount_invalid'),
  requestedCurrency: z.enum(['TRY', 'USD', 'EUR', 'GBP']),
  transactionDescription: z.string(),
  correctionReason: z
    .union([z.enum(CORRECTION_REASONS), z.literal('')])
    .refine((v) => v !== '', 'cr_reason_required'),
  manualDescription: z.string().trim().min(1, 'cr_manual_desc_required'),
});

export type CorrectionFormSchema = z.infer<typeof correctionFormSchema>;
