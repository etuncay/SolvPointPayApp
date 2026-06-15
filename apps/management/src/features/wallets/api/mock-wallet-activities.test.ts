import { describe, expect, it, beforeEach } from 'vitest';
import { getWallets } from '@/lib/wallets-store';
import { DEFAULT_WALLET_ACTIVITY_FILTERS } from '../domain/activity-types';
import {
  __getAccessLog,
  __resetWalletStoresForTest,
  mockWalletsAdapter,
} from './mock-wallets-adapter';

describe('mock-wallets-adapter activities', () => {
  beforeEach(() => {
    __resetWalletStoresForTest();
  });

  it('walletId=A yalnızca A hareketleri', () => {
    const wallets = getWallets();
    const walletA = wallets.find((w) => w.recordStatus === 1 && w.cat === 'customer');
    const walletB = wallets.find((w) => w.recordStatus === 1 && w.id !== walletA?.id);
    expect(walletA).toBeTruthy();
    expect(walletB).toBeTruthy();

    const rowsA = mockWalletsAdapter.listActivities(walletA!.id, DEFAULT_WALLET_ACTIVITY_FILTERS, 'compliance');
    expect(rowsA.ok).toBe(true);
    if (!rowsA.ok) return;

    const rowsB = mockWalletsAdapter.listActivities(walletB!.id, DEFAULT_WALLET_ACTIVITY_FILTERS, 'compliance');
    expect(rowsB.ok).toBe(true);
    if (!rowsB.ok) return;

    const idsA = new Set(rowsA.rows.map((r) => r.id));
    for (const row of rowsB.rows) {
      expect(idsA.has(row.id)).toBe(false);
    }
  });

  it('Inflow movement → direction Inflow, amount > 0', () => {
    const wallet = getWallets().find((w) => w.walletNo === 'MS-9901-01');
    expect(wallet).toBeTruthy();
    const result = mockWalletsAdapter.listActivities(wallet!.id, DEFAULT_WALLET_ACTIVITY_FILTERS, 'compliance');
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const inflow = result.rows.find((r) => r.direction === 'Inflow');
    expect(inflow).toBeTruthy();
    expect(inflow!.amount).toBeGreaterThan(0);
  });

  it('postBalance movement değerini korur', () => {
    const wallet = getWallets().find((w) => w.recordStatus === 1);
    const result = mockWalletsAdapter.listActivities(wallet!.id, DEFAULT_WALLET_ACTIVITY_FILTERS, 'compliance');
    expect(result.ok).toBe(true);
    if (!result.ok || result.rows.length === 0) return;
    expect(typeof result.rows[0]!.postBalance).toBe('number');
  });

  it('finance + system wallet erişim var', () => {
    const systemWallet = getWallets().find((w) => w.cat === 'system' && w.recordStatus === 1);
    expect(systemWallet).toBeTruthy();
    const result = mockWalletsAdapter.listActivities(systemWallet!.id, DEFAULT_WALLET_ACTIVITY_FILTERS, 'finance');
    expect(result.ok).toBe(true);
  });

  it('ops + system wallet → wa_wallet_forbidden', () => {
    const systemWallet = getWallets().find((w) => w.cat === 'system' && w.recordStatus === 1);
    expect(systemWallet).toBeTruthy();
    const result = mockWalletsAdapter.listActivities(systemWallet!.id, DEFAULT_WALLET_ACTIVITY_FILTERS, 'ops');
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toBe('wa_wallet_forbidden');
  });

  it('varsayılan sıralama en yeni önce', () => {
    const wallet = getWallets().find((w) => w.walletNo === 'MS-9901-01');
    const result = mockWalletsAdapter.listActivities(wallet!.id, DEFAULT_WALLET_ACTIVITY_FILTERS, 'compliance');
    expect(result.ok).toBe(true);
    if (!result.ok || result.rows.length < 2) return;
    expect(result.rows[0]!.createdAt >= result.rows[1]!.createdAt).toBe(true);
  });

  it('export erişim logu yazar', () => {
    const wallet = getWallets().find((w) => w.recordStatus === 1 && w.cat === 'customer');
    mockWalletsAdapter.exportActivities(wallet!.id, DEFAULT_WALLET_ACTIVITY_FILTERS, 'ops');
    const log = __getAccessLog();
    expect(log.some((e) => e.action === 'activities_export')).toBe(true);
  });
});
