import type { TransferDraftInput } from '../types/customer-portal';

const STORAGE_KEY = 'epay.customer.pending-transfer';

export interface PendingTransferRecord {
  transactionId: string;
  referenceNo: string;
  foreignReferenceNo?: string;
  draft: TransferDraftInput;
}

export function loadPendingTransfer(): PendingTransferRecord | null {
  try {
    if (typeof sessionStorage === 'undefined') return null;
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PendingTransferRecord;
  } catch {
    return null;
  }
}

export function savePendingTransfer(record: PendingTransferRecord): void {
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    }
  } catch {
    /* private mode */
  }
}

export function clearPendingTransfer(): void {
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    /* ignore */
  }
}
