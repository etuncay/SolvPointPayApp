import { describe, expect, it, beforeEach } from 'vitest';
import {
  getIntegratedBanksStoreSnapshot,
  mockIntegratedBanksAdapter,
  resetIntegratedBanksStore,
} from './mock-integrated-banks-adapter';

const baseInput = {
  bankName: 'Denizbank',
  service: 'DenizEFT',
  eftStartTime: '09:00',
  eftEndTime: '17:00',
  isDefaultEft: false,
  hasIbanCheck: true,
  isDefaultIbanCheck: false,
  hasFast: false,
  isDefaultFast: false,
  reconciliationFeeApplied: false,
};

describe('mock-integrated-banks-adapter', () => {
  beforeEach(() => resetIntegratedBanksStore());

  it('list returns active-first sorted rows', () => {
    const rows = mockIntegratedBanksAdapter.list();
    expect(rows.every((r) => r.recordStatus === 1)).toBe(true);
    const firstInactive = rows.findIndex((r) => r.status === 'Inactive');
    const lastActive = rows.map((r) => r.status).lastIndexOf('Active');
    if (firstInactive >= 0) expect(lastActive).toBeLessThan(firstInactive);
  });

  it('create with default EFT swaps previous default', () => {
    const created = mockIntegratedBanksAdapter.create({ ...baseInput, isDefaultEft: true });
    expect(created.ok).toBe(true);
    const rows = getIntegratedBanksStoreSnapshot();
    expect(rows.find((b) => b.id === 1)?.isDefaultEft).toBe(false);
    expect(rows.find((b) => b.bankName === 'Denizbank')?.isDefaultEft).toBe(true);
  });

  it('deactivate default → ib_default_protected', () => {
    const result = mockIntegratedBanksAdapter.deactivate(1);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('ib_default_protected');
  });

  it('deactivate last active Fast → ib_last_active_fast', () => {
    mockIntegratedBanksAdapter.deactivate(3);
    mockIntegratedBanksAdapter.update(2, {
      bankName: 'Garanti BBVA',
      service: 'GarantiFastGateway',
      eftStartTime: '00:00',
      eftEndTime: '23:59',
      isDefaultEft: false,
      hasIbanCheck: true,
      isDefaultIbanCheck: false,
      hasFast: true,
      isDefaultFast: false,
      reconciliationFeeApplied: false,
    });
    const result = mockIntegratedBanksAdapter.deactivate(2);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe('ib_last_active_fast');
  });

  it('deactivate inactive idempotent', () => {
    mockIntegratedBanksAdapter.deactivate(4);
    const again = mockIntegratedBanksAdapter.deactivate(4);
    expect(again.ok).toBe(true);
  });
});
