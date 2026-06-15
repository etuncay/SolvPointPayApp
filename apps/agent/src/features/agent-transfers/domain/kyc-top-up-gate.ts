import type { SenderLookupResult } from '@/features/agent-transactions/domain/customer-lookup';

/** 6.1 — bireysel L2+; tüzel Approved + aktif. */
export function canTopUp(sender: SenderLookupResult): boolean {
  if (sender.status !== 'active') return false;
  if (sender.customerType === 'corporate') return sender.kycLevel === 'Approved';
  return sender.kycLevel === 'L2' || sender.kycLevel === 'L3';
}

export function getTopUpBlockReasonKey(sender: SenderLookupResult): string | null {
  return canTopUp(sender) ? null : 'ag_tr_own_kyc_required';
}
