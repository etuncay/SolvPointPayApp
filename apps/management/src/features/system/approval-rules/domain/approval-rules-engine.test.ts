import { describe, expect, it } from 'vitest';
import { evaluateFieldApproval } from './approval-rules-engine';

describe('evaluateFieldApproval', () => {
  it('tiers HighAmounts by limits', () => {
    expect(
      evaluateFieldApproval({
        operationName: 'customer.fee.update',
        screenKey: 'customers.fees',
        fieldName: 'variableFeePct',
        oldValue: 1,
        newValue: 500,
      }).requiredApprovals,
    ).toBe(0);
    expect(
      evaluateFieldApproval({
        operationName: 'customer.fee.update',
        screenKey: 'customers.fees',
        fieldName: 'variableFeePct',
        oldValue: 1,
        newValue: 3000,
      }).requiredApprovals,
    ).toBe(1);
    expect(
      evaluateFieldApproval({
        operationName: 'customer.fee.update',
        screenKey: 'customers.fees',
        fieldName: 'variableFeePct',
        oldValue: 1,
        newValue: 9000,
      }).requiredApprovals,
    ).toBe(2);
  });

  it('IncreasesOnly skips when not increased', () => {
    expect(
      evaluateFieldApproval({
        operationName: 'agent.commission.update',
        screenKey: 'agents.fees',
        fieldName: 'commissionRate',
        oldValue: 5,
        newValue: 4,
      }).requiredApprovals,
    ).toBe(0);
  });
});
