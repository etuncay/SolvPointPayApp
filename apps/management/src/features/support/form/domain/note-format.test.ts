import { describe, expect, it } from 'vitest';
import { appendCaseNote, formatCaseNoteLine } from './note-format';

describe('note-format', () => {
  it('formats append-only line', () => {
    const line = formatCaseNoteLine(
      {
        id: '1',
        caseId: 1,
        action: 'Assignment',
        statusAfter: 'Assigned',
        note: 'Test not',
        performedBy: 'u1',
        performedByName: 'Ayşe Demir',
        createdAt: '2026-05-24T10:00:00Z',
      },
      'Üzerime Al',
    );
    expect(line).toContain('Ayşe Demir');
    expect(line).toContain('Üzerime Al');
    expect(line).toContain('Test not');
  });

  it('appends to existing', () => {
    expect(appendCaseNote('satır1', 'satır2')).toBe('satır1\nsatır2');
  });
});
