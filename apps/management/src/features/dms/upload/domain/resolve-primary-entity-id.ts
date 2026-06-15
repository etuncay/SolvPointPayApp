import type { DocumentCategory, DocumentRelationInput } from '@/features/dms/domain/types';

/** Primary entity ID — spec §8, §19 (ilk satır) */
export function resolvePrimaryEntityId(
  category: DocumentCategory,
  relations: DocumentRelationInput[],
  lookupTransactionRef: (txKey: string) => string | null,
): string {
  if (relations.length === 0) return 'SYSTEM';

  const first = relations[0]!;
  if (category === 'ProofOfTransaction' && first.relationType === 'Transaction') {
    return lookupTransactionRef(first.relatedId) ?? first.relatedId;
  }
  return first.relatedId;
}
