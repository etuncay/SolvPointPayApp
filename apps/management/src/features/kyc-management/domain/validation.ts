import type { KycEntityDocument, KycNoteInput, KycVerifyInput } from './types';

export function validateNoteInput(input: KycNoteInput): { ok: true } | { ok: false; error: string } {
  if (!input.evaluationNote.trim()) return { ok: false, error: 'kyc_note_required' };
  return { ok: true };
}

export function validateDocumentsForDecision(
  docs: KycEntityDocument[],
): { ok: true } | { ok: false; error: string } {
  const active = docs.filter((d) => d.status === 'Active' || d.status === 'Approved');
  if (active.length < 1) return { ok: false, error: 'kyc_document_required' };
  return { ok: true };
}

export function validateVerifyInput(
  input: KycVerifyInput,
  docs: KycEntityDocument[],
): { ok: true } | { ok: false; error: string } {
  const note = validateNoteInput(input);
  if (!note.ok) return note;
  const docCheck = validateDocumentsForDecision(docs);
  if (!docCheck.ok) return docCheck;
  if (input.riskScore == null || Number.isNaN(input.riskScore)) {
    return { ok: false, error: 'kyc_score_required' };
  }
  if (!input.approverUserId.trim()) return { ok: false, error: 'kyc_approver_required' };
  return { ok: true };
}
