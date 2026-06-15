import { formatCustomerNo, parseCustomerNo } from '@/features/customer-search/domain/format-customer-no';
import { DEMO_AGENT_ID } from '@/features/transaction-confirmation/api/agent-transactions-store';
import { AGENTS } from '@/mocks/agents';
import { getAgentNotificationLogs } from '@/mocks/notification-logs';
import {
  createAgentFeedbackCase,
  uploadFeedbackAttachment,
} from '@/mocks/support-cases-store';
import { resolveNotifyTarget } from '../domain/resolve-notify-target';
import { validateFeedbackPayload } from '../domain/validation';
import type { FeedbackSubmitPayload, FeedbackSubmitResult, FeedbackUploadResult } from '../domain/types';

const ACCEPT_EXT = ['.pdf', '.jpg', '.jpeg', '.png'];
const ALLOWED_MIME = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_BYTES = 5 * 1024 * 1024;

function actingAgent() {
  return AGENTS.find((a) => a.id === DEMO_AGENT_ID && a.recordStatus === 1);
}

export interface AgentFeedbackService {
  uploadFeedbackAttachment(file: File): FeedbackUploadResult;
  createAgentFeedbackCase(payload: FeedbackSubmitPayload): FeedbackSubmitResult;
  getNotificationLogsForTest(): ReturnType<typeof getAgentNotificationLogs>;
}

export const mockAgentFeedbackAdapter: AgentFeedbackService = {
  uploadFeedbackAttachment(file) {
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!ACCEPT_EXT.includes(ext) || !ALLOWED_MIME.includes(file.type)) {
      return { ok: false, error: 'du_invalid_mime' };
    }
    if (file.size > MAX_BYTES) {
      return { ok: false, error: 'ag_fb_err_file_size' };
    }
    const { documentId } = uploadFeedbackAttachment(file.name);
    return { ok: true, documentId };
  },

  createAgentFeedbackCase(payload) {
    const validationError = validateFeedbackPayload(payload);
    if (validationError) return { ok: false, error: validationError };

    const notify = resolveNotifyTarget(payload.requesterOwner, payload.customerNo);
    if (!notify) return { ok: false, error: 'ag_fb_err_notify_target' };

    const agent = actingAgent();
    if (!agent) return { ok: false, error: 'ag_fb_err_agent_session' };

    const requesterType = payload.requesterOwner === 'Self' ? 'Agent' : 'Customer';
    let requesterId = String(DEMO_AGENT_ID);
    if (payload.requesterOwner === 'Customer') {
      const id = parseCustomerNo(payload.customerNo ?? '');
      requesterId = id != null ? formatCustomerNo(id) : payload.customerNo!.trim();
    }

    const row = createAgentFeedbackCase({
      requesterType,
      requesterId,
      subject: payload.subject,
      complaintType: payload.complaintType,
      detail: payload.detail,
      notesText: payload.notes,
      documentIds: payload.documentIds,
      notify,
      performedBy: String(DEMO_AGENT_ID),
      performedByName: agent.name,
    });

    return { ok: true, caseNo: row.caseNo, caseId: row.id };
  },

  getNotificationLogsForTest() {
    return getAgentNotificationLogs();
  },
};
