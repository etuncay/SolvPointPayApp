import { describe, expect, it } from 'vitest';
import type { IntegratedBank } from './types';
import {
  applyDefaultSwap,
  getDeactivateError,
  hasActiveFeatureBank,
  isFeatureOperational,
} from './default-rules';

function bank(partial: Partial<IntegratedBank> & Pick<IntegratedBank, 'id'>): IntegratedBank {
  return {
    bankName: 'Test',
    service: 'Svc',
    eftStartTime: null,
    eftEndTime: null,
    isDefaultEft: false,
    hasIbanCheck: false,
    isDefaultIbanCheck: false,
    hasFast: false,
    isDefaultFast: false,
    reconciliationFeeApplied: false,
    lastSuccessCallAt: null,
    status: 'Active',
    recordStatus: 1,
    ...partial,
  };
}

describe('integrated bank default-rules', () => {
  it('set default EFT on B clears A', () => {
    const banks = [
      bank({ id: 1, isDefaultEft: true }),
      bank({ id: 2, isDefaultEft: false }),
    ];
    const swapped = applyDefaultSwap(banks, 2, {
      isDefaultEft: true,
      isDefaultIbanCheck: false,
      isDefaultFast: false,
    });
    expect(swapped.find((b) => b.id === 1)?.isDefaultEft).toBe(false);
  });

  it('deactivate default → ib_default_protected', () => {
    const b = bank({ id: 1, isDefaultEft: true });
    expect(getDeactivateError(b, [b])).toBe('ib_default_protected');
  });

  it('deactivate last active Fast → ib_last_active_fast', () => {
    const fastOnly = bank({ id: 2, hasFast: true, isDefaultFast: false });
    const eftDefault = bank({ id: 3, isDefaultEft: true, hasFast: false });
    expect(getDeactivateError(fastOnly, [fastOnly, eftDefault])).toBe('ib_last_active_fast');
  });

  it('hasActiveFeatureBank false → isFeatureOperational false', () => {
    const rows = [bank({ id: 1, status: 'Inactive', hasFast: true })];
    expect(hasActiveFeatureBank('fast', rows)).toBe(false);
    expect(isFeatureOperational('fast', rows)).toBe(false);
  });
});
