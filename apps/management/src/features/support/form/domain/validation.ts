import type { SupportCaseFormValues } from '../../domain/types';

export function validateCreateForm(values: SupportCaseFormValues): { ok: true } | { ok: false; error: string } {
  if (!values.requesterType) return { ok: false, error: 'scf_requester_type_required' };
  if (!values.requesterId.trim()) return { ok: false, error: 'scf_requester_id_required' };
  if (!values.subject.trim()) return { ok: false, error: 'scf_subject_required' };
  if (!values.complaintType) return { ok: false, error: 'scf_complaint_type_required' };
  return { ok: true };
}

export function validateTransfer(payload: {
  departmentId: string;
  ownerUserId: string;
}): { ok: true } | { ok: false; error: string } {
  if (!payload.departmentId.trim() && !payload.ownerUserId.trim()) {
    return { ok: false, error: 'scf_transfer_required' };
  }
  return { ok: true };
}

export function validateResolve(payload: {
  resolutionCode: string;
  finalText: string;
}): { ok: true } | { ok: false; error: string } {
  if (!payload.resolutionCode) return { ok: false, error: 'scf_resolution_required' };
  if (!payload.finalText.trim()) return { ok: false, error: 'scf_final_text_required' };
  return { ok: true };
}

export function validateReject(payload: {
  reasonCode: string;
  explanation: string;
}): { ok: true } | { ok: false; error: string } {
  if (!payload.reasonCode) return { ok: false, error: 'scf_reject_reason_required' };
  if (!payload.explanation.trim()) return { ok: false, error: 'scf_reject_explanation_required' };
  return { ok: true };
}

export function validateReopen(payload: { reopenReason: string }): { ok: true } | { ok: false; error: string } {
  if (!payload.reopenReason.trim()) return { ok: false, error: 'scf_reopen_reason_required' };
  return { ok: true };
}

export function validateNotePayload(note: string): { ok: true } | { ok: false; error: string } {
  if (!note.trim()) return { ok: false, error: 'scf_note_required' };
  return { ok: true };
}
