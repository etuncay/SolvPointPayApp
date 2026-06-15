import { approvalsService } from '@/features/approval-pool/api';
import { getCurrentUser } from '@/features/approval-pool/domain/current-user';
import { userNameById } from '@/features/approval-pool/domain/current-user';
import { KYC_KNOWN_EXCEPTIONS_SEED } from '@/mocks/kyc-known-exceptions';
import { KYC_REVIEWS_SEED } from '@/mocks/kyc-reviews';
import { KYC_SCREENING_PAYLOADS } from '@/mocks/kyc-screening-payloads';
import type { BackOfficeRole } from '@epay/ui';
import { getKycPermissions } from '../domain/permissions';
import {
  getEntitySnapshot,
  resetEntityOverrides,
  syncEntityPatch,
} from '../domain/entity-projection';
import { resolveKnownException } from '../domain/known-exception';
import {
  applyFalsePositive,
  applyReject,
  applyRequestAdditional,
  applyVerifyFinalize,
  applyVerifySubmit,
  canApplyDecision,
} from '../domain/transitions';
import {
  validateDocumentsForDecision,
  validateNoteInput,
  validateVerifyInput,
} from '../domain/validation';
import type {
  KycActionResult,
  KycAuditEntry,
  KycDocumentInput,
  KycEntityDocument,
  KycNoteInput,
  KycReview,
  KycReviewDetail,
  KycVerifyInput,
} from '../domain/types';
import {
  applyKycVerifyApprovalIfNeeded,
  createKycVerifyApprovalRequest,
  parseKycVerifyApprovalMeta,
  registerKycVerifyApprovalApply,
} from './kyc-approval-bridge';
import type { KycReviewsService } from './kyc-reviews-service';

let store: KycReview[] = KYC_REVIEWS_SEED.map((r) => ({ ...r }));
const documents = new Map<number, KycEntityDocument[]>();
const auditLog = new Map<number, KycAuditEntry[]>();
let nextAudit = 1;
let nextDoc = 1;

function seedDocs() {
  documents.set(1, [
    { id: 'd1', title: 'TC Kimlik (Ön)', status: 'Active', uploadedAt: '2026-05-01T10:00:00Z' },
  ]);
  documents.set(2, [
    { id: 'd2', title: 'TC Kimlik (Ön)', status: 'Approved', uploadedAt: '2026-05-02T10:00:00Z' },
  ]);
  documents.set(5, [
    { id: 'd5', title: 'Adres Belgesi', status: 'Active', uploadedAt: '2026-05-15T10:00:00Z' },
  ]);
}

seedDocs();

function appendAudit(reviewId: number, actorName: string, action: string, note: string | null) {
  const list = auditLog.get(reviewId) ?? [];
  list.push({
    id: `KA-${nextAudit++}`,
    at: new Date('2026-05-24T12:00:00Z').toISOString(),
    actorName,
    action,
    note,
  });
  auditLog.set(reviewId, list);
}

function refreshKnownFlag(review: KycReview): KycReview {
  return {
    ...review,
    isKnownException: resolveKnownException(review, KYC_KNOWN_EXCEPTIONS_SEED),
  };
}

function enrichFromEntity(review: KycReview): KycReview {
  const snap = getEntitySnapshot(review.entityKind, review.entityId);
  if (!snap) return refreshKnownFlag(review);
  return refreshKnownFlag({
    ...review,
    entityStatus: snap.entityStatus,
    blockageReason: snap.blockageReason,
    kycStatusDisplay: snap.kycStatusDisplay,
    riskScore: snap.riskScore,
  } as KycReview & { riskScore?: number });
}

function sortRows(rows: KycReview[]) {
  return [...rows].sort((a, b) => new Date(b.queryTime).getTime() - new Date(a.queryTime).getTime());
}

function guardRole(role: BackOfficeRole, needList = false): KycActionResult | null {
  const p = getKycPermissions(role);
  if (needList && !p.list) return { ok: false, error: 'fx_forbidden' };
  if (!needList && !p.detail) return { ok: false, error: 'fx_forbidden' };
  return null;
}

function applyTransition(review: KycReview, patch: ReturnType<typeof applyFalsePositive>) {
  syncEntityPatch(review.entityKind, review.entityId, patch.entityPatch);
  const next: KycReview = {
    ...review,
    decision: patch.decision,
    entityStatus: patch.entityPatch.status ?? review.entityStatus,
    blockageReason: patch.entityPatch.blockReason ?? review.blockageReason,
    inQueue: patch.decision === 'PendingVerification' || patch.decision === 'RequestAdditional',
  };
  if (patch.decision === 'Verified' || patch.decision === 'Rejected' || patch.decision === 'FalsePositive') {
    next.inQueue = false;
  }
  return refreshKnownFlag(next);
}

function finalizeReviewByApproval(approvalId: number) {
  const approval = approvalsService.getById(approvalId);
  if (!approval) return;
  const meta = parseKycVerifyApprovalMeta(approval);
  if (!meta) return;
  const idx = store.findIndex((r) => r.id === meta.reviewId);
  if (idx < 0) return;
  const review = store[idx]!;
  const tr = applyVerifyFinalize(meta.riskScore);
  store[idx] = applyTransition(review, tr);
  appendAudit(review.id, 'Sistem', 'verify_finalize', meta.evaluationNote);
}

registerKycVerifyApprovalApply(finalizeReviewByApproval);

export const mockKycReviewsAdapter: KycReviewsService = {
  list(role) {
    const g = guardRole(role, true);
    if (g) return [];
    return sortRows(store.filter((r) => r.inQueue).map((r) => enrichFromEntity(r)));
  },

  getById(id, role) {
    const g = guardRole(role);
    if (g) return null;
    const review = store.find((r) => r.id === id);
    if (!review) return null;
    const snap = getEntitySnapshot(review.entityKind, review.entityId);
    const enriched = enrichFromEntity(review);
    return {
      ...enriched,
      riskScore: review.proposedRiskScore ?? snap?.riskScore ?? 0,
      riskSegment: snap?.riskSegment ?? 'med',
      rawJson: KYC_SCREENING_PAYLOADS[review.screeningPayloadId] ?? {},
      documents: [...(documents.get(id) ?? [])],
      auditLog: [...(auditLog.get(id) ?? [])],
    };
  },

  countOpen() {
    return store.filter((r) => r.inQueue && (r.decision == null || r.decision === 'PendingVerification')).length;
  },

  falsePositive(id, input, role) {
    const g = guardRole(role);
    if (g) return g;
    if (!getKycPermissions(role).falsePositive) return { ok: false, error: 'fx_forbidden' };
    const note = validateNoteInput(input);
    if (!note.ok) return note;
    const idx = store.findIndex((r) => r.id === id);
    if (idx < 0) return { ok: false, error: 'finrec_not_found' };
    const review = store[idx]!;
    if (!canApplyDecision(review.decision)) return { ok: false, error: 'kyc_already_decided' };
    const docCheck = validateDocumentsForDecision(documents.get(id) ?? []);
    if (!docCheck.ok) return docCheck;
    store[idx] = applyTransition(review, applyFalsePositive());
    store[idx]!.evaluationNote = input.evaluationNote.trim();
    appendAudit(id, getCurrentUser(role).displayName, 'false_positive', input.evaluationNote.trim());
    return { ok: true };
  },

  requestAdditional(id, input, role) {
    const g = guardRole(role);
    if (g) return g;
    const note = validateNoteInput(input);
    if (!note.ok) return note;
    const idx = store.findIndex((r) => r.id === id);
    if (idx < 0) return { ok: false, error: 'finrec_not_found' };
    const review = store[idx]!;
    if (!canApplyDecision(review.decision)) return { ok: false, error: 'kyc_already_decided' };
    store[idx] = applyTransition(review, applyRequestAdditional());
    store[idx]!.evaluationNote = input.evaluationNote.trim();
    appendAudit(id, getCurrentUser(role).displayName, 'request_additional', input.evaluationNote.trim());
    return { ok: true };
  },

  reject(id, input, role) {
    const g = guardRole(role);
    if (g) return g;
    const note = validateNoteInput(input);
    if (!note.ok) return note;
    const idx = store.findIndex((r) => r.id === id);
    if (idx < 0) return { ok: false, error: 'finrec_not_found' };
    const review = store[idx]!;
    if (!canApplyDecision(review.decision)) return { ok: false, error: 'kyc_already_decided' };
    store[idx] = applyTransition(review, applyReject());
    store[idx]!.evaluationNote = input.evaluationNote.trim();
    appendAudit(id, getCurrentUser(role).displayName, 'reject', input.evaluationNote.trim());
    return { ok: true };
  },

  verify(id, input, role) {
    const g = guardRole(role);
    if (g) return g;
    const idx = store.findIndex((r) => r.id === id);
    if (idx < 0) return { ok: false, error: 'finrec_not_found' };
    const review = store[idx]!;
    if (!canApplyDecision(review.decision)) return { ok: false, error: 'kyc_already_decided' };
    const v = validateVerifyInput(input, documents.get(id) ?? []);
    if (!v.ok) return v;
    const created = createKycVerifyApprovalRequest(
      {
        reviewId: id,
        entityNo: review.entityNo,
        displayName: review.displayName,
        riskScore: input.riskScore,
        evaluationNote: input.evaluationNote.trim(),
      },
      role,
    );
    if (!created.ok || created.approvalId == null) return created;
    const tr = applyVerifySubmit(input.riskScore);
    syncEntityPatch(review.entityKind, review.entityId, tr.entityPatch);
    store[idx] = refreshKnownFlag({
      ...review,
      decision: tr.decision,
      evaluationNote: input.evaluationNote.trim(),
      proposedRiskScore: input.riskScore,
      approvalId: created.approvalId,
      inQueue: true,
    });
    appendAudit(id, getCurrentUser(role).displayName, 'verify_submit', input.evaluationNote.trim());
    return { ok: true, approvalId: created.approvalId };
  },

  finalizeVerify(id, role) {
    const g = guardRole(role);
    if (g) return g;
    if (!getKycPermissions(role).verifyFinalize) return { ok: false, error: 'fx_forbidden' };
    const idx = store.findIndex((r) => r.id === id);
    if (idx < 0) return { ok: false, error: 'finrec_not_found' };
    const review = store[idx]!;
    if (review.decision !== 'PendingVerification') return { ok: false, error: 'kyc_already_decided' };
    const user = getCurrentUser(role);
    if (review.approvalId) {
      const result = approvalsService.approve(review.approvalId, user, 'KYC doğrulama onayı');
      if (!result.ok) return result;
      applyKycVerifyApprovalIfNeeded(review.approvalId);
      return { ok: true };
    }
    const score = review.proposedRiskScore ?? 40;
    store[idx] = applyTransition(review, applyVerifyFinalize(score));
    appendAudit(id, user.displayName, 'verify_finalize', review.evaluationNote);
    return { ok: true };
  },

  addDocument(id, input, role) {
    const g = guardRole(role);
    if (g) return g;
    if (!getKycPermissions(role).addDocument) return { ok: false, error: 'fx_forbidden' };
    const idx = store.findIndex((r) => r.id === id);
    if (idx < 0) return { ok: false, error: 'finrec_not_found' };
    const list = documents.get(id) ?? [];
    list.push({
      id: `KD-${nextDoc++}`,
      title: input.type,
      status: 'Active',
      uploadedAt: new Date('2026-05-24T12:00:00Z').toISOString(),
    });
    documents.set(id, list);
    appendAudit(id, getCurrentUser(role).displayName, 'add_document', input.type);
    return { ok: true };
  },
};

export function resetKycReviewsStoreForTest(): void {
  store = KYC_REVIEWS_SEED.map((r) => ({ ...r }));
  documents.clear();
  auditLog.clear();
  nextAudit = 1;
  nextDoc = 1;
  seedDocs();
  resetEntityOverrides();
}

export function countOpenKycReviews(): number {
  return mockKycReviewsAdapter.countOpen();
}

export { userNameById };
