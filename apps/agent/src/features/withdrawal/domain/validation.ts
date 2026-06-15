import { z } from 'zod';

/** Para çekme form doğrulaması — sorgu sonrası alanlar. */
export const withdrawalFormSchema = z
  .object({
    currency: z.string().min(1),
    amount: z.coerce.number().gt(0),
    transactionReferenceNo: z.string().trim().optional().default(''),
    foreignReferenceNo: z.string().trim().optional().default(''),
    isSuspicious: z.boolean().optional().default(false),
    authorizedPersonIdNo: z.string().trim().optional().default(''),
    isCorporate: z.boolean().optional().default(false),
  })
  .superRefine((val, ctx) => {
    // Referans no'lardan en az biri zorunlu
    if (!val.transactionReferenceNo && !val.foreignReferenceNo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['transactionReferenceNo'],
        message: 'ag_wd_err_reference_required',
      });
    }
    // Tüzel müşteride yetkili kişi zorunlu
    if (val.isCorporate && !val.authorizedPersonIdNo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['authorizedPersonIdNo'],
        message: 'ag_wd_err_authorized_required',
      });
    }
  });

export type WithdrawalFormInput = z.infer<typeof withdrawalFormSchema>;

export interface WithdrawalValidationError {
  field: string;
  message: string;
}

export function validateWithdrawalForm(values: Record<string, unknown>): WithdrawalValidationError[] {
  const result = withdrawalFormSchema.safeParse(values);
  if (result.success) return [];
  return result.error.issues.map((issue) => ({
    field: String(issue.path[0] ?? ''),
    message: issue.message,
  }));
}
