import { describe, expect, it, beforeEach } from 'vitest';
import { BANK_MOVEMENT_INGEST_DUP_PAYLOAD } from '@/mocks/bank-account-movements';
import {
  getBankMovementsStoreSnapshot,
  mockBankMovementsAdapter,
  resetBankMovementsStore,
} from './mock-bank-movements-adapter';
import { DEFAULT_BANK_MOVEMENT_FILTERS } from '../domain/types';

describe('mock-bank-movements-adapter', () => {
  beforeEach(() => resetBankMovementsStore());

  it('list hides recordStatus=0', () => {
    const rows = mockBankMovementsAdapter.list(DEFAULT_BANK_MOVEMENT_FILTERS, 'finance');
    expect(rows.every((r) => r.recordStatus === 1)).toBe(true);
    expect(rows.some((r) => r.bankTransactionNo === 'BTX-SOFT-DELETED')).toBe(false);
  });

  it('list sorts transactionDate DESC', () => {
    const rows = mockBankMovementsAdapter.list(DEFAULT_BANK_MOVEMENT_FILTERS, 'ops');
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i - 1]!.transactionDate >= rows[i]!.transactionDate).toBe(true);
    }
  });

  it('amountMin filter returns subset', () => {
    const all = mockBankMovementsAdapter.list(DEFAULT_BANK_MOVEMENT_FILTERS, 'finance');
    const filtered = mockBankMovementsAdapter.list(
      { ...DEFAULT_BANK_MOVEMENT_FILTERS, amountMin: '100000' },
      'finance',
    );
    expect(filtered.length).toBeLessThanOrEqual(all.length);
    expect(filtered.every((r) => r.amount >= 100_000)).toBe(true);
  });

  it('ingest new record increases store', () => {
    const before = getBankMovementsStoreSnapshot().filter((m) => m.recordStatus === 1).length;
    const result = mockBankMovementsAdapter.ingest({
      ...BANK_MOVEMENT_INGEST_DUP_PAYLOAD,
      bankTransactionNo: 'BTX-NEW-UNIQUE',
      transactionDate: '2026-05-25 12:00:00',
    });
    expect(result.ok).toBe(true);
    const after = getBankMovementsStoreSnapshot().filter((m) => m.recordStatus === 1).length;
    expect(after).toBe(before + 1);
  });

  it('ingest duplicate key does not insert', () => {
    const before = getBankMovementsStoreSnapshot().filter((m) => m.recordStatus === 1).length;
    const result = mockBankMovementsAdapter.ingest(BANK_MOVEMENT_INGEST_DUP_PAYLOAD);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.duplicate).toBe(true);
    const after = getBankMovementsStoreSnapshot().filter((m) => m.recordStatus === 1).length;
    expect(after).toBe(before);
    const dupLogs = mockBankMovementsAdapter
      .getAccessLog()
      .filter((l) => l.action === 'ingest_duplicate');
    expect(dupLogs.length).toBeGreaterThan(0);
  });

  it('exportRows returns same filter as list', () => {
    const filters = { ...DEFAULT_BANK_MOVEMENT_FILTERS, currency: 'EUR' as const };
    const listed = mockBankMovementsAdapter.list(filters, 'finance');
    const exported = mockBankMovementsAdapter.exportRows(filters, 'finance');
    expect(exported).toEqual(listed);
    expect(exported.length).toBeGreaterThan(0);
  });

  it('compliance role gets empty list', () => {
    const rows = mockBankMovementsAdapter.list(DEFAULT_BANK_MOVEMENT_FILTERS, 'compliance');
    expect(rows).toEqual([]);
  });

  it('export row shape has 16 spec fields', () => {
    const [row] = mockBankMovementsAdapter.exportRows(DEFAULT_BANK_MOVEMENT_FILTERS, 'finance');
    expect(row).toBeTruthy();
    const keys = [
      'sourceBank',
      'sourceIban',
      'targetBank',
      'targetIban',
      'currency',
      'amount',
      'paymentStatus',
      'bankTransferMethod',
      'createdAt',
      'transactionDate',
      'referenceNo',
      'name',
      'taxNo',
      'bankTransactionNo',
      'description',
      'errorMessage',
    ] as const;
    expect(keys).toHaveLength(16);
    for (const k of keys) {
      expect(row).toHaveProperty(k);
    }
  });
});
