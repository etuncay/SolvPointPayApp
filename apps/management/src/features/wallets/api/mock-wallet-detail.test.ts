import { describe, expect, it, beforeEach } from 'vitest';
import { calcAvailable } from '../domain/calc-available';
import {
  __resetWalletStoresForTest,
  mockWalletsAdapter,
} from './mock-wallets-adapter';

describe('mock-wallets-adapter detail', () => {
  beforeEach(() => {
    __resetWalletStoresForTest();
  });

  it('tam bloke (-1) → available 0', () => {
    const detail = mockWalletsAdapter.getDetail(11, 'ops');
    expect(detail).not.toBeNull();
    mockWalletsAdapter.applyBalanceBlock(
      11,
      { blockedAmount: -1, blockEndDate: null, reason: 'Tam bloke test' },
      'ops',
    );
    const after = mockWalletsAdapter.getDetail(11, 'ops');
    expect(after?.blocked).toBe(-1);
    expect(calcAvailable(after!.balance, after!.blocked)).toBe(0);
    expect(after?.available).toBe(0);
  });

  it('not append-only çalışır', () => {
    const before = mockWalletsAdapter.getDetail(11, 'ops')!.notes.length;
    mockWalletsAdapter.addNote(11, { text: 'Yeni not' }, 'ops');
    const after = mockWalletsAdapter.getDetail(11, 'ops')!;
    expect(after.notes.length).toBe(before + 1);
    expect(after.notesDisplay).toContain('Yeni not');
  });

  it('limit güncelleme geçmişe yazar', () => {
    const before = mockWalletsAdapter.getLimitHistory(11).length;
    const limits = mockWalletsAdapter.getDetail(11, 'ops')!.limits;
    limits.Withdrawal.Single = 75_000;
    mockWalletsAdapter.updateLimits(11, limits, 'ops');
    expect(mockWalletsAdapter.getLimitHistory(11).length).toBeGreaterThan(before);
  });

  it('pasif grup değil — finance bloke yapamaz', () => {
    const result = mockWalletsAdapter.applyBalanceBlock(
      11,
      { blockedAmount: 500, blockEndDate: null, reason: 'test' },
      'finance',
    );
    expect(result.ok).toBe(false);
    expect(result.error).toBe('ag_perm_denied');
  });

  it('batch unblock süresi dolmuş blokeleri kaldırır', () => {
    mockWalletsAdapter.applyBalanceBlock(
      11,
      { blockedAmount: 1000, blockEndDate: '2020-01-01', reason: 'expired' },
      'compliance',
    );
    const count = mockWalletsAdapter.runBatchUnblock();
    expect(count).toBeGreaterThan(0);
    const after = mockWalletsAdapter.getDetail(11, 'compliance');
    expect(after?.blocked).toBe(0);
  });
});
