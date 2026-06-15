import { describe, expect, it } from 'vitest';
import { requiresParameterApproval } from './requires-parameter-approval';

describe('requiresParameterApproval', () => {
  it('fraud timeout any change requires approval', () => {
    expect(
      requiresParameterApproval(
        'fraud.engine_timeout_ms',
        { value: '-1', status: 'Active' },
        { value: '200', status: 'Active' },
      ),
    ).toBe(true);
  });

  it('fraud timeout zero requires approval via criticalZeroConfirm', () => {
    expect(
      requiresParameterApproval(
        'fraud.engine_timeout_ms',
        { value: '200', status: 'Active' },
        { value: '0', status: 'Active' },
      ),
    ).toBe(true);
  });

  it('reconciliation tolerance direct save', () => {
    expect(
      requiresParameterApproval(
        'reconciliation.amount_tolerance_try',
        { value: '0.01', status: 'Active' },
        { value: '0.02', status: 'Active' },
      ),
    ).toBe(false);
  });

  it('treasury reserve change requires approval', () => {
    expect(
      requiresParameterApproval(
        'treasury.reserve_max_amount_try',
        { value: '5000000', status: 'Active' },
        { value: '6000000', status: 'Active' },
      ),
    ).toBe(true);
  });
});
