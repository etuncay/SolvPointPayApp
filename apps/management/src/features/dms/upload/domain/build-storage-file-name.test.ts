import { describe, expect, it } from 'vitest';
import { buildStorageFileName } from './build-storage-file-name';

describe('build-storage-file-name', () => {
  it('builds ID-TypeCode-Timestamp pattern', () => {
    const at = new Date('2026-05-24T14:30:22');
    expect(buildStorageFileName('10042', 'IDCARD', 'scan.pdf', at)).toBe(
      '10042-IDCARD-20260524143022.pdf',
    );
  });

  it('uses SYSTEM when no relations (via caller)', () => {
    const at = new Date('2026-01-01T00:00:00');
    expect(buildStorageFileName('SYSTEM', 'PAYSLIP', 'p.xlsx', at)).toMatch(
      /^SYSTEM-PAYSLIP-\d{14}\.xlsx$/,
    );
  });
});
