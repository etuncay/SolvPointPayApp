import type { BackOfficeRole } from '@epay/ui';
import type { DocumentCategory } from '@/features/document-review/domain/types';
import type { DocumentTypeFormPayload, DocumentTypeSaveResult } from '../form/domain/form-types';
import type {
  DocumentTypeDefinition,
  DocumentTypeMaster,
  DocumentTypesFilters,
} from '../domain/types';

export type DocumentTypesService = {
  list(filters: DocumentTypesFilters, role: BackOfficeRole): DocumentTypeMaster[];
  listByCategory(category: DocumentCategory): DocumentTypeMaster[];
  listByCategoryForUpload(role: BackOfficeRole, category: DocumentCategory): DocumentTypeDefinition[];
  getById(id: string): DocumentTypeMaster | null;
  getTypeDefinitionById(id: string): DocumentTypeDefinition | undefined;
  getAllTypeDefinitions(): DocumentTypeDefinition[];
  create(role: BackOfficeRole, payload: DocumentTypeFormPayload): DocumentTypeSaveResult;
  update(role: BackOfficeRole, id: string, payload: DocumentTypeFormPayload): DocumentTypeSaveResult;
};
