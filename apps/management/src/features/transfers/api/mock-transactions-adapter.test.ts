import { describe, expect, it, beforeEach } from 'vitest';
import { DEFAULT_TRANSACTION_FILTERS } from '../domain/types';
import { mapUrlStatus } from '../domain/status-map';
import {
  __getTransactionAccessLog,
  __resetTransactionStoresForTest,
  mockTransactionsAdapter,
} from './mock-transactions-adapter';

describe('mock-transactions-adapter', () => {
  beforeEach(() => {
    __resetTransactionStoresForTest();
  });

  it('list kaynak tutar + sourceCurrency', async () => {
    const rows = await mockTransactionsAdapter.list(DEFAULT_TRANSACTION_FILTERS, 'ops');
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0]!.principalAmount).toBeGreaterThan(0);
    expect(rows[0]!.sourceCurrency).toBeTruthy();
  });

  it('WalletToBankAccount IBAN dolu; WalletToPerson null', async () => {
    const rows = await mockTransactionsAdapter.list(DEFAULT_TRANSACTION_FILTERS, 'compliance');
    const bank = rows.find((r) => r.transactionType === 'WalletToBankAccount');
    const person = rows.find((r) => r.transactionType === 'WalletToPerson');
    expect(bank?.iban).toBeTruthy();
    expect(person?.iban).toBeNull();
  });

  it('recordStatus=0 listelenmez', async () => {
    const rows = await mockTransactionsAdapter.list(DEFAULT_TRANSACTION_FILTERS, 'compliance');
    expect(rows.some((r) => r.transactionNo.startsWith('TX-DELETED'))).toBe(false);
  });

  it('status=pending URL map → Pending filtresi', async () => {
    const status = mapUrlStatus('pending');
    const rows = await mockTransactionsAdapter.list({ ...DEFAULT_TRANSACTION_FILTERS, status }, 'ops');
    expect(rows.every((r) => r.status === 'Pending')).toBe(true);
    expect(rows.length).toBeGreaterThanOrEqual(5);
  });

  it('export erişim logu yazar', async () => {
    await mockTransactionsAdapter.exportRows(DEFAULT_TRANSACTION_FILTERS, 'finance');
    const log = __getTransactionAccessLog();
    expect(log.some((e) => e.action === 'export')).toBe(true);
  });
});
