import { describe, expect, it, beforeEach } from 'vitest';
import {
  mockFraudRulesAdapter,
  __resetFraudRulesStoreForTest,
} from './mock-fraud-rules-adapter';
import { EMPTY_FRAUD_RULE_INPUT } from '../detail/domain/types';

describe('mockFraudRulesAdapter detail', () => {
  beforeEach(() => {
    __resetFraudRulesStoreForTest();
  });

  it('getDetail versions + exceptions', () => {
    const d = mockFraudRulesAdapter.getDetail('FR-001', 'compliance');
    expect(d).not.toBeNull();
    expect(d!.versions.length).toBeGreaterThan(0);
    expect(d!.exceptions.length).toBeGreaterThan(0);
  });

  it('update version count +1', () => {
    const before = mockFraudRulesAdapter.getDetail('FR-002', 'compliance')!.versions.length;
    const input = {
      ...EMPTY_FRAUD_RULE_INPUT,
      title: 'Yüksek tutar güncel',
      description: 'test',
      scope: 'Remittance' as const,
      conditionDsl: 'amount > 100000',
      status: 'Active' as const,
      priority: 'High' as const,
      regulationReference: 'X',
      actionDetails: [{ type: 'Hold' as const }, { type: 'CreateCase' as const, params: { severity: 'High' } }],
      dslValidatedAt: new Date().toISOString(),
    };
    const r = mockFraudRulesAdapter.update('FR-002', input, 'compliance');
    expect(r.ok).toBe(true);
    const after = mockFraudRulesAdapter.getDetail('FR-002', 'compliance')!.versions.length;
    expect(after).toBe(before + 1);
  });

  it('invalid DSL save blocked', () => {
    const r = mockFraudRulesAdapter.update(
      'FR-003',
      {
        ...EMPTY_FRAUD_RULE_INPUT,
        title: 'X',
        scope: 'Onboarding',
        conditionDsl: '',
        dslValidatedAt: new Date().toISOString(),
      },
      'compliance',
    );
    expect(r.ok).toBe(false);
  });

  it('simulate metrics object', () => {
    const m = mockFraudRulesAdapter.simulate('FR-001', null, 'compliance');
    expect(m).not.toBeNull();
    expect(m!.totalTransactions).toBeGreaterThan(0);
  });

  it('addException store +1', () => {
    const before = mockFraudRulesAdapter.getDetail('FR-001', 'compliance')!.exceptions.length;
    const r = mockFraudRulesAdapter.addException(
      'FR-001',
      { customerNo: '88888', expiresAt: '2027-01-01', note: 'test' },
      'compliance',
    );
    expect(r.ok).toBe(true);
    const after = mockFraudRulesAdapter.getDetail('FR-001', 'compliance')!.exceptions.length;
    expect(after).toBe(before + 1);
  });
});
