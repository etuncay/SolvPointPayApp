import type { BackOfficeRole } from '@epay/ui';
import type {
  ApprovePayload,
  DecisionResult,
  RejectPayload,
  RequestAdditionalPayload,
  ReviewDocumentDetail,
  ReviewQueueFilters,
  ReviewQueueItem,
} from '../domain/types';

export type DocumentReviewService = {
  listReviewQueue(role: BackOfficeRole, filters?: ReviewQueueFilters): ReviewQueueItem[];
  getDocumentDetail(id: number, role: BackOfficeRole): ReviewDocumentDetail | null;
  downloadDocument(id: number): { ok: boolean; filename: string };
  approve(id: number, role: BackOfficeRole, payload: ApprovePayload): DecisionResult;
  reject(id: number, role: BackOfficeRole, payload: RejectPayload): DecisionResult;
  requestAdditional(id: number, role: BackOfficeRole, payload: RequestAdditionalPayload): DecisionResult;
};
