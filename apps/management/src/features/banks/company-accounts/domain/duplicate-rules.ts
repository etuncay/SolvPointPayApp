import { normalizeIban } from '../../shared/iban';
import type { CompanyBankAccount } from './types';

/** Aktif kayıtlarda aynı IBAN var mı — §7 tek aktif IBAN */
export function hasDuplicateActiveIban(
  iban: string,
  accounts: CompanyBankAccount[],
  excludeId?: number,
): boolean {
  const normalized = normalizeIban(iban);
  return accounts.some(
    (a) =>
      a.recordStatus === 1 &&
      a.status === 'Active' &&
      a.id !== excludeId &&
      normalizeIban(a.iban) === normalized,
  );
}
