import { describe, expect, it } from 'vitest';
import { getMissingHrDocuments } from './required-hr-documents';

describe('getMissingHrDocuments', () => {
  it('requires work permit for foreign nationality', () => {
    const missing = getMissingHrDocuments({
      nationality: 'DEU',
      employmentStatus: 'Active',
      documents: [{ id: '1', type: 'IdentityCopy', typeLabelKey: '', fileName: 'a.pdf', uploadedAt: '' }],
    });
    expect(missing).toContain('WorkPermit');
    expect(missing).toContain('EmploymentContract');
  });

  it('returns empty when all required present for TUR', () => {
    const missing = getMissingHrDocuments({
      nationality: 'TUR',
      employmentStatus: 'Active',
      documents: [
        { id: '1', type: 'IdentityCopy', typeLabelKey: '', fileName: 'a.pdf', uploadedAt: '' },
        { id: '2', type: 'EmploymentContract', typeLabelKey: '', fileName: 'b.pdf', uploadedAt: '' },
        { id: '3', type: 'SgkEntry', typeLabelKey: '', fileName: 'c.pdf', uploadedAt: '' },
      ],
    });
    expect(missing).toEqual([]);
  });
});
