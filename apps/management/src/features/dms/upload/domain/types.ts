import type {
  DocumentCategory,
  DocumentRelationInput,
  DocumentUploadPayload,
} from '@/features/dms/domain/types';

export type { DocumentRelationInput, DocumentUploadPayload };

export type UploadFormValues = {
  category: DocumentCategory | '';
  documentTypeId: string;
  validFrom: string;
  validUntil: string;
  relations: DocumentRelationInput[];
};

export const EMPTY_UPLOAD_FORM: UploadFormValues = {
  category: '',
  documentTypeId: '',
  validFrom: '',
  validUntil: '',
  relations: [],
};
