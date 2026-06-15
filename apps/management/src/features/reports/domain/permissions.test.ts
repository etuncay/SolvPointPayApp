import { describe, expect, it } from 'vitest';
import { canGenerateReport, canViewReportCatalog } from './permissions';

describe('report permissions', () => {
  it('ops cannot view catalog', () => {
    expect(canViewReportCatalog('ops')).toBe(false);
  });

  it('finance cannot generate MASAK', () => {
    expect(canGenerateReport('finance', 'str_output')).toBe(false);
    expect(canGenerateReport('finance', 'financial_transactions')).toBe(true);
  });

  it('compliance limited operational', () => {
    expect(canGenerateReport('compliance', 'financial_transactions')).toBe(false);
    expect(canGenerateReport('compliance', 'risk_compliance_summary')).toBe(true);
    expect(canGenerateReport('compliance', 'str_output')).toBe(true);
  });
});
