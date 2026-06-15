import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react';
import { agentFeedbackService } from '../api/agent-feedback-service';
import type { AgentComplaintType } from '../domain/complaint-type';
import { EMPTY_FEEDBACK_FORM, type FeedbackSubmitPayload, type RequesterOwner } from '../domain/types';

export type PendingAttachment = {
  documentId: string;
  fileName: string;
  sizeBytes: number;
};

type FeedbackAttachmentsContextValue = {
  attachments: PendingAttachment[];
  uploadError: string | null;
  addFiles: (files: FileList | File[]) => void;
  removeAttachment: (documentId: string) => void;
  clearAttachments: () => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  openFilePicker: () => void;
};

const FeedbackAttachmentsContext = createContext<FeedbackAttachmentsContextValue | null>(null);

export function useFeedbackAttachments(): FeedbackAttachmentsContextValue {
  const ctx = useContext(FeedbackAttachmentsContext);
  if (!ctx) throw new Error('useFeedbackAttachments must be used within FeedbackAttachmentsProvider');
  return ctx;
}

export function useAgentFeedback() {
  const [formKey, setFormKey] = useState(0);
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successCaseNo, setSuccessCaseNo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const addFiles = useCallback((files: FileList | File[]) => {
    setUploadError(null);
    const list = Array.from(files);
    for (const file of list) {
      const result = agentFeedbackService.uploadFeedbackAttachment(file);
      if (!result.ok) {
        setUploadError(result.error);
        return;
      }
      setAttachments((prev) => {
        if (prev.some((a) => a.documentId === result.documentId)) return prev;
        return [
          ...prev,
          { documentId: result.documentId, fileName: file.name, sizeBytes: file.size },
        ];
      });
    }
  }, []);

  const removeAttachment = useCallback((documentId: string) => {
    setAttachments((prev) => prev.filter((a) => a.documentId !== documentId));
  }, []);

  const clearAttachments = useCallback(() => {
    setAttachments([]);
    setUploadError(null);
  }, []);

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const attachmentCtx = useMemo<FeedbackAttachmentsContextValue>(
    () => ({
      attachments,
      uploadError,
      addFiles,
      removeAttachment,
      clearAttachments,
      fileInputRef,
      openFilePicker,
    }),
    [attachments, uploadError, addFiles, removeAttachment, clearAttachments, openFilePicker],
  );

  const resetForm = useCallback(() => {
    clearAttachments();
    setSuccessCaseNo(null);
    setFormKey((k) => k + 1);
  }, [clearAttachments]);

  const submit = useCallback(
    async (values: Record<string, unknown>): Promise<{ ok: true; caseNo: string } | { ok: false; error: string }> => {
      setSubmitting(true);
      try {
        const payload: FeedbackSubmitPayload = {
          requesterOwner: String(values.requesterOwner ?? 'Self') as RequesterOwner,
          customerNo: values.requesterOwner === 'Customer' ? String(values.customerNo ?? '') : undefined,
          subject: String(values.subject ?? ''),
          complaintType: String(values.complaintType ?? '') as AgentComplaintType,
          detail: String(values.detail ?? ''),
          notes: String(values.notes ?? ''),
          documentIds: attachments.map((a) => a.documentId),
        };
        const result = agentFeedbackService.createAgentFeedbackCase(payload);
        if (!result.ok) return result;
        setSuccessCaseNo(result.caseNo);
        clearAttachments();
        setFormKey((k) => k + 1);
        return { ok: true, caseNo: result.caseNo };
      } finally {
        setSubmitting(false);
      }
    },
    [attachments, clearAttachments],
  );

  return {
    formKey,
    initialValues: EMPTY_FEEDBACK_FORM,
    submitting,
    successCaseNo,
    attachmentCtx,
    FeedbackAttachmentsProvider: FeedbackAttachmentsContext.Provider,
    resetForm,
    submit,
    openFilePicker,
  };
}
