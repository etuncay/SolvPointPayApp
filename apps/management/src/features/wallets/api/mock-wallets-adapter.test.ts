import { describe, expect, it, beforeEach } from 'vitest';
import { DEFAULT_WALLET_FILTERS } from '../domain/types';
import {
  __getAccessLog,
  __resetWalletStoresForTest,
  mockWalletsAdapter,
} from './mock-wallets-adapter';

describe('mock-wallets-adapter list', () => {
  beforeEach(() => {
    __resetWalletStoresForTest();
  });

  it('ops rolünde sistem cüzdanları gizli', () => {
    const rows = mockWalletsAdapter.list(DEFAULT_WALLET_FILTERS, 'ops');
    expect(rows.some((w) => w.cat === 'system')).toBe(false);
    expect(rows.some((w) => w.cat === 'customer')).toBe(true);
  });

  it('finance rolünde müşteri cüzdanları gizli', () => {
    const rows = mockWalletsAdapter.list(DEFAULT_WALLET_FILTERS, 'finance');
    expect(rows.some((w) => w.cat === 'customer')).toBe(false);
    expect(rows.some((w) => w.cat === 'system')).toBe(true);
  });

  it('compliance tüm kategorileri görür', () => {
    const rows = mockWalletsAdapter.list(DEFAULT_WALLET_FILTERS, 'compliance');
    expect(rows.some((w) => w.cat === 'customer')).toBe(true);
    expect(rows.some((w) => w.cat === 'agent')).toBe(true);
    expect(rows.some((w) => w.cat === 'system')).toBe(true);
  });

  it('recordStatus=0 kayıtları listelenmez', () => {
    const rows = mockWalletsAdapter.list(DEFAULT_WALLET_FILTERS, 'compliance');
    expect(rows.some((w) => w.walletNo.startsWith('DELETED-'))).toBe(false);
  });

  it('export erişim logu yazar', () => {
    mockWalletsAdapter.exportRows(DEFAULT_WALLET_FILTERS, 'ops');
    const log = __getAccessLog();
    expect(log.some((e) => e.action === 'export')).toBe(true);
  });
});
