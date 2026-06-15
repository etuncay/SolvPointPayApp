import type { DmsDocument, DocumentStatus } from './types';

/** §17 batch arşiv — mock; gerçek backend/cron yok */
export function applyArchiveExpiredBatch(
  docs: DmsDocument[],
  asOf: Date,
): { updated: number; docs: DmsDocument[] } {
  const cutoff = asOf.toISOString().slice(0, 10);
  let updated = 0;

  const next = docs.map((doc) => {
    if (doc.recordStatus !== 1) return doc;
    if (doc.documentStatus !== 'Active' && doc.documentStatus !== 'Archived') return doc;
    if (!doc.validUntil || doc.validUntil >= cutoff) return doc;

    updated += 1;
    const status: DocumentStatus = 'Expired';
    return { ...doc, documentStatus: status };
  });

  return { updated, docs: next };
}
