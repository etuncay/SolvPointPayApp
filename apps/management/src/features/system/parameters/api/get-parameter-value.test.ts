import { describe, expect, it, beforeEach } from 'vitest';
import {
  getActiveParameterValue,
  getParameterByKey,
  getParameterValue,
  resetSystemParametersStore,
  updateParameterRecord,
} from '@/mocks/system-parameters';

describe('getParameterValue', () => {
  beforeEach(() => {
    resetSystemParametersStore();
  });

  it('reads active numeric value', () => {
    expect(getActiveParameterValue('reconciliation.amount_tolerance_try', 0)).toBe(0.01);
  });

  it('Passive uses catalog default via getParameterValue', () => {
    const p = getParameterByKey('reconciliation.amount_tolerance_try')!;
    updateParameterRecord(p.id, { status: 'Passive', value: '99' });
    expect(getParameterValue('reconciliation.amount_tolerance_try', 0)).toBe(0.01);
  });
});
