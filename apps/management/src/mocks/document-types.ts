/**
 * Geriye dönük import yolu — master store: document-types-store + documentTypesService
 */
import {
  getDocumentTypeMasterById,
  getDocumentTypesStore,
} from '@/mocks/document-types-store';
import {
  toTypeDefinition,
  type DocumentTypeDefinition,
} from '@/features/dms/document-types/domain/types';

export type { DocumentTypeDefinition };

export const DOCUMENT_TYPES: DocumentTypeDefinition[] = getDocumentTypesStore().map(toTypeDefinition);

export function getDocumentTypeById(id: string): DocumentTypeDefinition | undefined {
  const m = getDocumentTypeMasterById(id);
  return m ? toTypeDefinition(m) : undefined;
}
