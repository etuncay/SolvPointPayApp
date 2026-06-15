import type {
  BackgroundCheckStatus,
  CorporateCustomerDetail,
  CorporateFormValues,
  DocumentUploadInput,
  SaveResult,
} from '../domain/types';
import type { DocumentRow } from '@/mocks/sample-person';

export type CorporateCustomersService = {
  getById(id: string): CorporateCustomerDetail | null;
  lookupByTaxNo(taxNo: string): CorporateCustomerDetail | null;
  create(payload: CorporateFormValues, opts?: { draft?: boolean }): SaveResult;
  update(id: string, payload: CorporateFormValues): SaveResult;
  block(id: string, reason: string, blockEndDate?: string): SaveResult;
  unblock(id: string): SaveResult;
  runBackgroundChecks(id: string | null, payload: CorporateFormValues): BackgroundCheckStatus;
  uploadDocument(customerId: string | null, doc: DocumentUploadInput): DocumentRow;
};
