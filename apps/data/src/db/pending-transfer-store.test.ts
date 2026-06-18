import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TransferDraftInput } from '../types/customer-portal';
import {
  clearPendingTransfer,
  loadPendingTransfer,
  savePendingTransfer,
} from './pending-transfer-store';

const draft: TransferDraftInput = {
  kind: 'domestic',
  title: 'Yurt İçi Transfer',
  sourceWalletId: 'w1',
  recipientName: 'Ali Veli',
  country: 'TR',
  currency: 'TRY',
  symbol: '₺',
  amount: 100,
  fee: 5,
  total: 105,
  purpose: 'family',
};

describe('pending-transfer-store', () => {
  const storage = new Map<string, string>();

  beforeEach(() => {
    storage.clear();
    vi.stubGlobal('sessionStorage', {
      getItem: (k: string) => storage.get(k) ?? null,
      setItem: (k: string, v: string) => {
        storage.set(k, v);
      },
      removeItem: (k: string) => {
        storage.delete(k);
      },
    });
    clearPendingTransfer();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns null when empty', () => {
    expect(loadPendingTransfer()).toBeNull();
  });

  it('persists pending transfer in sessionStorage', () => {
    savePendingTransfer({
      transactionId: 'TRX-1',
      referenceNo: 'REF-ABC',
      draft,
    });
    expect(loadPendingTransfer()).toEqual({
      transactionId: 'TRX-1',
      referenceNo: 'REF-ABC',
      draft,
    });
  });

  it('clear removes stored transfer', () => {
    savePendingTransfer({ transactionId: 'TRX-1', referenceNo: 'REF-ABC', draft });
    clearPendingTransfer();
    expect(loadPendingTransfer()).toBeNull();
  });
});
