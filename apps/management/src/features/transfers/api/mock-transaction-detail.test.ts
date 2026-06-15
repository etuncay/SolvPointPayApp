import { describe, expect, it, beforeEach } from 'vitest';
import { __resetWalletStoresForTest } from '@/features/wallets/api/mock-wallets-adapter';
import { DEFAULT_TRANSACTION_FILTERS } from '../domain/types';
import {
  __getTransactionChangeLog,
  __resetTransactionStoresForTest,
  mockTransactionsAdapter,
} from './mock-transactions-adapter';

describe('mock-transaction-detail', () => {
  beforeEach(() => {
    __resetTransactionStoresForTest();
    __resetWalletStoresForTest();
  });

  async function firstPendingId(): Promise<number> {
    const rows = await mockTransactionsAdapter.list(
      { ...DEFAULT_TRANSACTION_FILTERS, status: 'Pending' },
      'compliance',
    );
    expect(rows.length).toBeGreaterThan(0);
    return rows[0]!.id;
  }

  async function firstOnHoldId(): Promise<number> {
    const rows = await mockTransactionsAdapter.list(
      { ...DEFAULT_TRANSACTION_FILTERS, status: 'OnHold' },
      'compliance',
    );
    expect(rows.length).toBeGreaterThan(0);
    return rows[0]!.id;
  }

  it('getDetail joins notes, docs, block', async () => {
    const id = await firstOnHoldId();
    const detail = await mockTransactionsAdapter.getDetail(id, 'compliance');
    expect(detail).not.toBeNull();
    expect(detail!.notes.length).toBeGreaterThan(0);
    expect(detail!.notesDisplay).toContain('–');
    expect(detail!.activeBlock).not.toBeNull();
  });

  it('hold Pending → OnHold + block kaydı', async () => {
    const id = await firstPendingId();
    const result = await mockTransactionsAdapter.hold(id, 'Test bloke', 'compliance');
    expect(result.ok).toBe(true);
    const detail = await mockTransactionsAdapter.getDetail(id, 'compliance');
    expect(detail!.status).toBe('OnHold');
    expect(detail!.activeBlock?.blockedAmount).toBeGreaterThan(0);
    expect(__getTransactionChangeLog().some((e) => e.action === 'hold')).toBe(true);
  });

  it('hold gerekçesiz → td_reason_required', async () => {
    const id = await firstPendingId();
    const result = await mockTransactionsAdapter.hold(id, '   ', 'compliance');
    expect(result.ok).toBe(false);
    expect(result.error).toBe('wd_block_reason_required');
  });

  it('unblock OnHold → Unblocked', async () => {
    const id = await firstOnHoldId();
    const result = await mockTransactionsAdapter.unblock(id, 'İnceleme tamam', 'compliance');
    expect(result.ok).toBe(true);
    const detail = await mockTransactionsAdapter.getDetail(id, 'compliance');
    expect(detail!.status).toBe('Unblocked');
    expect(detail!.activeBlock).toBeNull();
  });

  it('cancel Pending → Canceled', async () => {
    const id = await firstPendingId();
    const result = await mockTransactionsAdapter.cancel(id, 'Müşteri talebi', 'compliance');
    expect(result.ok).toBe(true);
    const detail = await mockTransactionsAdapter.getDetail(id, 'compliance');
    expect(detail!.status).toBe('Canceled');
  });

  it('finance müdahale edemez', async () => {
    const id = await firstPendingId();
    const result = await mockTransactionsAdapter.hold(id, 'Deneme', 'finance');
    expect(result.ok).toBe(false);
    expect(result.error).toBe('td_permission_denied');
  });

  it('submitApproval onay havuzu kaydı döner', async () => {
    const id = await firstPendingId();
    const result = await mockTransactionsAdapter.submitApproval(id, 'compliance');
    expect(result.ok).toBe(true);
    expect(typeof result.approvalId).toBe('number');
    expect(result.approvalId).toBeGreaterThan(0);
  });
});
