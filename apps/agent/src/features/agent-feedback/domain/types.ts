import type { AgentComplaintType } from './complaint-type';

/** Talep sahibi — UI seçimi. */
export type RequesterOwner = 'Self' | 'Customer';

export type FeedbackFormState = {
  requesterOwner: RequesterOwner;
  customerNo: string;
  subject: string;
  complaintType: AgentComplaintType | '';
  detail: string;
  notes: string;
};

export const EMPTY_FEEDBACK_FORM: FeedbackFormState = {
  requesterOwner: 'Self',
  customerNo: '',
  subject: '',
  complaintType: '',
  detail: '',
  notes: '',
};

export type FeedbackSubmitPayload = {
  requesterOwner: RequesterOwner;
  customerNo?: string;
  subject: string;
  complaintType: AgentComplaintType;
  detail: string;
  notes: string;
  documentIds: string[];
};

export type FeedbackSubmitResult =
  | { ok: true; caseNo: string; caseId: number }
  | { ok: false; error: string };

export type FeedbackUploadResult =
  | { ok: true; documentId: string }
  | { ok: false; error: string };
