import type {
  AgentDetail,
  AgentFormValues,
  BackgroundCheckStatus,
  DocumentUploadInput,
  SaveResult,
} from '../domain/types';
import type { DocumentRow } from '@/mocks/sample-person';

export type AgentDetailService = {
  getById(id: string): AgentDetail | null;
  lookupByVkn(vkn: string): AgentDetail | null;
  create(payload: AgentFormValues, opts?: { draft?: boolean }): SaveResult;
  update(id: string, payload: AgentFormValues): SaveResult;
  block(id: string, reason: string, blockEndDate?: string): SaveResult;
  unblock(id: string): SaveResult;
  runBackgroundChecks(id: string | null, payload: AgentFormValues): BackgroundCheckStatus;
  uploadDocument(agentId: string | null, doc: DocumentUploadInput): DocumentRow;
};
