import type {
  BackgroundCheckStatus,
  DocumentUploadInput,
  IndividualCustomerDetail,
  IndividualFormValues,
  KpsIdentityPayload,
  SaveResult,
} from '../domain/types';
import type { DocumentRow } from '@/mocks/sample-person';

export type IndividualCustomersService = {
  getById(id: string): IndividualCustomerDetail | null;
  lookupByIdentity(idNo: string, birthDate: string): IndividualCustomerDetail | null;
  create(payload: IndividualFormValues, opts?: { draft?: boolean }): SaveResult;
  update(id: string, payload: IndividualFormValues): SaveResult;
  block(id: string, reason: string, blockEndDate?: string): SaveResult;
  unblock(id: string): SaveResult;
  fetchKps(idNo: string, birthDate: string): KpsIdentityPayload | null;
  runBackgroundChecks(id: string | null, payload: IndividualFormValues): BackgroundCheckStatus;
  uploadDocument(customerId: string | null, doc: DocumentUploadInput): DocumentRow;
};
