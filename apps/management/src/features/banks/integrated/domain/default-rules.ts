import type { DefaultFeature, IntegratedBank, IntegratedBankInput } from './types';

function activeRows(banks: IntegratedBank[]): IntegratedBank[] {
  return banks.filter((b) => b.recordStatus === 1 && b.status === 'Active');
}

/** Özellik için en az bir aktif banka var mı */
export function hasActiveFeatureBank(feature: DefaultFeature, banks: IntegratedBank[]): boolean {
  const active = activeRows(banks);
  switch (feature) {
    case 'eft':
      return active.length > 0;
    case 'ibanCheck':
      return active.some((b) => b.hasIbanCheck);
    case 'fast':
      return active.some((b) => b.hasFast);
  }
}

/** Transfer modülleri için capability export — §20 #2 */
export function isFeatureOperational(feature: DefaultFeature, banks: IntegratedBank[]): boolean {
  return hasActiveFeatureBank(feature, banks);
}

export function applyDefaultSwap(
  banks: IntegratedBank[],
  targetId: number | null,
  input: Pick<IntegratedBankInput, 'isDefaultEft' | 'isDefaultIbanCheck' | 'isDefaultFast'>,
): IntegratedBank[] {
  return banks.map((b) => {
    if (targetId != null && b.id === targetId) return b;
    return {
      ...b,
      isDefaultEft: input.isDefaultEft ? false : b.isDefaultEft,
      isDefaultIbanCheck: input.isDefaultIbanCheck ? false : b.isDefaultIbanCheck,
      isDefaultFast: input.isDefaultFast ? false : b.isDefaultFast,
    };
  });
}

export function isAnyDefault(bank: IntegratedBank): boolean {
  return bank.isDefaultEft || bank.isDefaultIbanCheck || bank.isDefaultFast;
}

/** Pasife alma guard — null = izin verilir */
export function getDeactivateError(bank: IntegratedBank, allBanks: IntegratedBank[]): string | null {
  if (isAnyDefault(bank)) return 'ib_default_protected';

  const others = activeRows(allBanks).filter((b) => b.id !== bank.id);

  if (others.length === 0) return 'ib_last_active_eft';

  if (bank.hasIbanCheck && !others.some((b) => b.hasIbanCheck)) {
    return 'ib_last_active_iban';
  }

  if (bank.hasFast && !others.some((b) => b.hasFast)) {
    return 'ib_last_active_fast';
  }

  return null;
}
