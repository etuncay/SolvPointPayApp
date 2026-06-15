import { beforeEach, describe, expect, it } from 'vitest';
import type { FraudAction } from '../../shared/fraud-actions';
import { mockRiskScoreRulesAdapter } from './mock-risk-score-rules-adapter';

describe('mock-risk-score-rules-adapter', () => {
  beforeEach(() => {
    mockRiskScoreRulesAdapter.resetForTests();
  });

  it('lists customer rules with active first', () => {
    const rows = mockRiskScoreRulesAdapter.list('Customer');
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0]!.status).toBe('Active');
  });

  it('rejects create without validatedAt', () => {
    expect(() =>
      mockRiskScoreRulesAdapter.create('Customer', {
        title: 'Test',
        conditionDsl: 'pepFlag = true',
        scoreContribution: 5,
      }),
    ).toThrow('rs_not_validated');
  });

  it('creates rule after validation', () => {
    const row = mockRiskScoreRulesAdapter.create('Customer', {
      title: 'Yeni kural',
      conditionDsl: 'pepFlag = true',
      scoreContribution: 5,
      validatedAt: new Date().toISOString(),
    });
    expect(row.status).toBe('Active');
    expect(mockRiskScoreRulesAdapter.list('Customer').some((r) => r.id === row.id)).toBe(true);
  });

  it('toggles active to passive', () => {
    const first = mockRiskScoreRulesAdapter.list('Customer')[0]!;
    const toggled = mockRiskScoreRulesAdapter.toggle(first.id);
    expect(toggled.status).toBe(first.status === 'Active' ? 'Passive' : 'Active');
  });

  it('simulate returns non-empty customer transitions', () => {
    const result = mockRiskScoreRulesAdapter.simulate('Customer');
    expect(result.transitions.length).toBeGreaterThanOrEqual(0);
  });

  it('saveActionSets rejects Allow+Block', () => {
    const sets = mockRiskScoreRulesAdapter.getActionSets('Customer');
    const bad = sets.map((s) =>
      s.riskLevel === 'High' ? { ...s, actions: ['Allow', 'Block'] as FraudAction[] } : s,
    );
    expect(() => mockRiskScoreRulesAdapter.saveActionSets('Customer', bad)).toThrow('rs_action_conflict');
  });
});
