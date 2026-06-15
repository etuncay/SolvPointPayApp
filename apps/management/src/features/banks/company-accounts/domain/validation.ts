import { z } from 'zod';
import { isValidIban, normalizeIban } from '../../shared/iban';

export const companyBankAccountInputSchema = z.object({
  bankId: z.number().int().positive(),
  accountType: z.enum(['Current', 'Protection']),
  iban: z.string().min(1, 'cba_iban_required'),
  currency: z.enum(['TRY', 'USD', 'EUR']),
  branchCode: z.string().trim().min(1, 'cba_branch_required'),
  accountNo: z.string().trim().min(1, 'cba_account_no_required'),
  suffix: z.string().nullable(),
});

export type CompanyBankAccountInputSchema = z.infer<typeof companyBankAccountInputSchema>;

export function validateCompanyBankAccountInput(
  input: unknown,
): { ok: true; data: CompanyBankAccountInputSchema & { iban: string } } | { ok: false; error: string } {
  const parsed = companyBankAccountInputSchema.safeParse(input);
  if (!parsed.success) {
    const code = parsed.error.issues[0]?.message ?? 'ib_validation_failed';
    return { ok: false, error: code };
  }

  const iban = normalizeIban(parsed.data.iban);
  if (!isValidIban(iban)) {
    return { ok: false, error: 'cba_iban_invalid' };
  }

  return {
    ok: true,
    data: {
      ...parsed.data,
      iban,
      suffix: parsed.data.suffix?.trim() || null,
      branchCode: parsed.data.branchCode.trim(),
      accountNo: parsed.data.accountNo.trim(),
    },
  };
}
