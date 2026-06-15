import type { BalanceBlockInput, WalletLimitSet } from './detail-types';
import { LIMIT_GROUPS, LIMIT_TYPES } from './detail-types';

function isValidLimitAmount(value: number): boolean {
  return value === -1 || value >= 0;
}

/** Bloke tutar + gerekçe zorunlu; bitiş tarihi yarın ve sonrası */
export function validateBalanceBlock(input: BalanceBlockInput, today: string): string | null {
  if (input.blockedAmount !== -1 && input.blockedAmount < 0) {
    return 'wd_block_amount_invalid';
  }
  if (!input.reason.trim()) return 'wd_block_reason_required';
  if (input.blockEndDate) {
    if (input.blockEndDate <= today) return 'wd_block_end_past';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.blockEndDate)) return 'cn_end_date_invalid';
  }
  return null;
}

export function validateAddNote(text: string): string | null {
  if (!text.trim()) return 'wd_note_required';
  return null;
}

export function validateLimitSet(limits: WalletLimitSet): string | null {
  for (const group of LIMIT_GROUPS) {
    for (const type of LIMIT_TYPES) {
      const value = limits[group][type];
      if (!isValidLimitAmount(value)) return 'wd_limit_invalid';
    }
  }
  return null;
}
