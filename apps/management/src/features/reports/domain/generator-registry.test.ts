import { describe, expect, it } from 'vitest';
import { ALL_REPORT_CODES } from './report-codes';
import { getReportGenerator, registeredReportCodes } from './generator-registry';

describe('generator-registry', () => {
  it('registers all 14 codes', () => {
    expect(registeredReportCodes().length).toBe(14);
    for (const code of ALL_REPORT_CODES) {
      expect(getReportGenerator(code)).not.toBeNull();
    }
  });
});
