import { describe, expect, it } from 'vitest';
import { buildRelationHref } from './relation-links';

describe('relation-links', () => {
  it('Customer 10042 → individual customer route', () => {
    expect(buildRelationHref('Customer', '10042')).toBe('/customers/99901/individual');
  });

  it('Agent AG-1001 → agent route', () => {
    expect(buildRelationHref('Agent', 'AG-1001')).toBe('/agents/099901');
  });

  it('Transaction TX-2024-001 → transfer detail', () => {
    const href = buildRelationHref('Transaction', 'TX-2024-001');
    expect(href).toMatch(/^\/transfers\/\d+$/);
  });

  it('Complaint → support case stub', () => {
    expect(buildRelationHref('Complaint', 'CASE-6001')).toBe('/support/cases/CASE-6001');
  });

  it('Employee → hr stub path', () => {
    expect(buildRelationHref('Employee', 'EMP-900')).toBe('/hr/employees/EMP-900');
  });
});
