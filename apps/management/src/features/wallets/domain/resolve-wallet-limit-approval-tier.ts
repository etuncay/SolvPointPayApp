import { evaluateFieldApproval } from '@/features/system/approval-rules/domain/approval-rules-engine';
import { tierApprovalCount } from '@/features/system/approval-rules/domain/high-amount-tier';
import type { ApprovalCount } from '@/features/system/approval-rules/domain/types';
import type { WalletLimitSet } from './detail-types';
import { walletLimitsToFlat } from './wallet-limits-to-flat';

/** 4.1 — yüksek tutarlı limit değişiklikleri için varsayılan kademe (12.2 alan kuralı yoksa). */
const DEFAULT_NO_APPROVAL_TRY = 100_000;
const DEFAULT_ONE_APPROVAL_TRY = 500_000;

function isAmountField(fieldName: string): boolean {
  return fieldName.endsWith('Amount') || fieldName.endsWith('Single');
}

function defaultTierForAmount(newValue: unknown): ApprovalCount {
  const num = Number(newValue);
  if (!Number.isFinite(num) || num <= 0) return 0;
  return tierApprovalCount(num, DEFAULT_NO_APPROVAL_TRY, DEFAULT_ONE_APPROVAL_TRY, 2);
}

/**
 * Değişen limit alanları için gerekli onay kademesini çözümler (0 = doğrudan kayıt).
 * Önce 12.2 alan kuralları; tutar alanlarında eşleşme yoksa varsayılan yüksek-rakam kademesi.
 */
export function resolveWalletLimitRequiredApprovals(
  oldLimits: WalletLimitSet,
  newLimits: WalletLimitSet,
): ApprovalCount {
  const oldFlat = walletLimitsToFlat(oldLimits);
  const newFlat = walletLimitsToFlat(newLimits);
  let maxRequired: ApprovalCount = 0;

  for (const fieldName of Object.keys(newFlat)) {
    const oldValue = oldFlat[fieldName];
    const newValue = newFlat[fieldName];
    if (oldValue === newValue) continue;

    const fromRule = evaluateFieldApproval({
      operationName: 'wallet.limit.update',
      screenKey: 'wallets.detail',
      fieldName,
      oldValue,
      newValue,
    }).requiredApprovals;

    let required = fromRule;
    if (required === 0 && isAmountField(fieldName)) {
      required = defaultTierForAmount(newValue);
    }

    if (required > maxRequired) maxRequired = required;
  }

  return maxRequired;
}
