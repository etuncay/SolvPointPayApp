import { beforeEach, describe, expect, it } from 'vitest';
import type { PartyReportRow } from '../domain/types';
import { mockRiskComplianceAdapter } from './mock-risk-compliance-adapter';

describe('mock-risk-compliance-adapter', () => {
  beforeEach(() => {
    mockRiskComplianceAdapter.resetForTests();
  });

  it('compliance dashboard loads all panels', async () => {
    const panels = await mockRiskComplianceAdapter.getDashboard('compliance');
    expect(panels.case_age?.status).toBe('ready');
    expect(panels.customers?.status).toBe('ready');
    expect(panels.rule_performance?.status).toBe('ready');
  });

  it('simulateError isolates failed panel', async () => {
    const panels = await mockRiskComplianceAdapter.getDashboard('compliance', {
      simulateError: 'rule_performance',
    });
    expect(panels.rule_performance?.status).toBe('error');
    expect(panels.customers?.status).toBe('ready');
    expect(panels.case_age?.status).toBe('ready');
  });

  it('finance cannot load dashboard panels', async () => {
    const panels = await mockRiskComplianceAdapter.getDashboard('finance');
    expect(Object.keys(panels)).toHaveLength(0);
  });

  it('getReport sorts customers by dispute desc by default', async () => {
    const rows = (await mockRiskComplianceAdapter.getReport(
      'customers',
      'compliance',
    )) as PartyReportRow[];
    expect(rows[0]!.disputeCount).toBeGreaterThanOrEqual(rows[1]!.disputeCount);
  });

  it('access log records dashboard fetch', async () => {
    await mockRiskComplianceAdapter.getDashboard('management');
    const log = mockRiskComplianceAdapter.getAccessLog();
    expect(log.some((e) => e.action === 'dashboard')).toBe(true);
  });
});
