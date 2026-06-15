import { describe, expect, it } from 'vitest';
import { DMS_DOCUMENTS_SEED } from '@/mocks/documents';
import { applyArchiveExpiredBatch } from './archive-expired-batch';

describe('archive-expired-batch', () => {
  it('marks Active docs past validUntil as Expired', () => {
    const { updated, docs } = applyArchiveExpiredBatch(
      DMS_DOCUMENTS_SEED.map((d) => ({ ...d })),
      new Date('2026-06-01T00:00:00Z'),
    );
    expect(updated).toBeGreaterThanOrEqual(1);
    const expired = docs.find((d) => d.id === 'DOC-006');
    expect(expired?.documentStatus).toBe('Expired');
  });

  it('does not change Rejected documents', () => {
    const { docs } = applyArchiveExpiredBatch(
      DMS_DOCUMENTS_SEED.map((d) => ({ ...d })),
      new Date('2026-06-01T00:00:00Z'),
    );
    expect(docs.find((d) => d.id === 'DOC-003')?.documentStatus).toBe('Rejected');
  });
});
