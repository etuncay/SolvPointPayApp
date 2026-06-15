import type {
  AuthorizedPersonDetail,
  AuthorizedPersonFormValues,
  BackgroundCheckStatus,
  DocumentUploadInput,
  KpsIdentityPayload,
  SaveResult,
} from '../domain/types';
import type { DocumentRow } from '@/mocks/sample-person';

export type AuthorizedPersonService = {
  getById(id: string): AuthorizedPersonDetail | null;
  lookupByIdentity(idNo: string, birthDate: string): AuthorizedPersonDetail | null;
  create(payload: AuthorizedPersonFormValues, opts?: { draft?: boolean }): SaveResult;
  update(id: string, payload: AuthorizedPersonFormValues): SaveResult;
  block(id: string, reason: string, blockEndDate?: string): SaveResult;
  unblock(id: string): SaveResult;
  fetchKps(idNo: string, birthDate: string): KpsIdentityPayload | null;
  runBackgroundChecks(id: string | null, payload: AuthorizedPersonFormValues): BackgroundCheckStatus;
  uploadDocument(personId: string | null, doc: DocumentUploadInput): DocumentRow;
};
