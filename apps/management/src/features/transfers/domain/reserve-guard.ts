import { convertToTry } from './fx-convert';
import type { CorrectionCurrency } from './correction-types';

/** Mock — kasa (system_reserve) max düzeltme (TRY eşdeğeri) */
export const MAX_RESERVE_CORRECTION_TRY = 500_000;

export function isReserveWallet(walletType: string, walletCategory: string): boolean {
  return walletCategory === 'system' && walletType === 'system_reserve';
}

export function validateReserveMax(
  sourceWalletType: string,
  sourceWalletCategory: string,
  requestedAmount: number,
  requestedCurrency: CorrectionCurrency,
): string | null {
  if (!isReserveWallet(sourceWalletType, sourceWalletCategory)) return null;
  const tryEq = convertToTry(requestedAmount, requestedCurrency);
  if (tryEq > MAX_RESERVE_CORRECTION_TRY) return 'cr_reserve_max_exceeded';
  return null;
}
