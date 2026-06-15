import { z } from 'zod';
import { isValidIban } from './iban';

const baseSchema = z.object({
  currency: z.string().min(1),
  amount: z.coerce.number().gt(0),
  clientReference: z.string().trim().min(1),
  isSuspicious: z.boolean().optional().default(false),
  authorizedPersonIdNo: z.string().trim().optional().default(''),
  isCorporate: z.boolean().optional().default(false),
});

export const ownWalletSchema = baseSchema.extend({
  walletNo: z.string().min(1),
});

export const bankAccountSchema = baseSchema.extend({
  receiverName: z.string().trim().min(1),
  receiverPhone: z.string().trim().optional().default(''),
  receiverEmail: z.string().trim().optional().default(''),
  iban: z.string().trim().min(15),
  paymentPurpose: z.string().min(1),
  description: z.string().trim().optional().default(''),
}).superRefine((val, ctx) => {
  if (!isValidIban(val.iban)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['iban'], message: 'ag_tr_err_iban_invalid' });
  }
});

export const personSchema = baseSchema.extend({
  receiverName: z.string().trim().min(1),
  receiverIdNo: z.string().trim().optional().default(''),
  receiverPhone: z.string().trim().optional().default(''),
  receiverEmail: z.string().trim().optional().default(''),
  paymentPurpose: z.string().min(1),
  description: z.string().trim().optional().default(''),
});

export const abroadSchema = baseSchema.extend({
  receiverName: z.string().trim().min(1),
  country: z.string().trim().min(2),
  receiverPhone: z.string().trim().optional().default(''),
  receiverEmail: z.string().trim().optional().default(''),
  targetCurrency: z.string().min(3),
  paymentPurpose: z.string().min(1),
  description: z.string().trim().optional().default(''),
});

export interface ValidationError {
  field: string;
  message: string;
}

export function validateVariantForm(
  variant: 'ownWallet' | 'bankAccount' | 'person' | 'abroad',
  values: Record<string, unknown>,
): ValidationError[] {
  const schema =
    variant === 'ownWallet'
      ? ownWalletSchema
      : variant === 'bankAccount'
        ? bankAccountSchema
        : variant === 'person'
          ? personSchema
          : abroadSchema;

  const result = schema.safeParse(values);
  if (result.success) return [];
  return result.error.issues.map((issue) => ({
    field: String(issue.path[0] ?? ''),
    message: issue.message,
  }));
}
