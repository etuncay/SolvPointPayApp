import { STANDARD_DOCUMENT_TYPES } from '@/features/dms/document-types/domain/standard-types';
import type { DocumentTypeMaster } from '@/features/dms/document-types/domain/types';

let store: DocumentTypeMaster[] = STANDARD_DOCUMENT_TYPES.map((t) => ({ ...t }));

export function getDocumentTypesStore(): DocumentTypeMaster[] {
  return store.filter((t) => t.recordStatus === 1);
}

export function getDocumentTypeMasterById(id: string): DocumentTypeMaster | undefined {
  return store.find((t) => t.id === id && t.recordStatus === 1);
}

export function getAllDocumentTypesIncludingInactive(): DocumentTypeMaster[] {
  return store.map((t) => ({ ...t }));
}

export function appendDocumentType(row: DocumentTypeMaster): void {
  store = [...store, row];
}

export function updateDocumentType(
  id: string,
  patch: Omit<DocumentTypeMaster, 'id' | 'documentTypeCode'>,
): boolean {
  const idx = store.findIndex((t) => t.id === id && t.recordStatus === 1);
  if (idx < 0) return false;
  const prev = store[idx]!;
  store = store.map((t, i) =>
    i === idx
      ? {
          ...prev,
          ...patch,
          id: prev.id,
          documentTypeCode: prev.documentTypeCode,
        }
      : t,
  );
  return true;
}

export function isDocumentTypeCodeTakenInStore(code: string, excludeId?: string): boolean {
  const norm = code.trim().toUpperCase();
  return store.some(
    (t) =>
      t.recordStatus === 1 &&
      t.documentTypeCode.toUpperCase() === norm &&
      (excludeId == null || t.id !== excludeId),
  );
}

export function resetDocumentTypesStore(seed: DocumentTypeMaster[] = STANDARD_DOCUMENT_TYPES): void {
  store = seed.map((t) => ({ ...t }));
}
