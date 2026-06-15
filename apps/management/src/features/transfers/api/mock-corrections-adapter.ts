import { getWallets } from '@/lib/wallets-store';
import { getCurrentUser } from '@/features/approval-pool/domain/current-user';
import { approvalsService } from '@/features/approval-pool/api';
import {
  enrichCorrectionApprovalPayload,
  registerCorrectionApprovalApply,
  finalizeCorrectionOnApprove,
  type CorrectionApprovalMeta,
} from './correction-approval-bridge';
import type { BackOfficeRole } from '@epay/ui';
import { correctionFormSchema } from '../domain/correction-validation';
import { getCorrectionPermissions } from '../domain/correction-permissions';
import { computeCorrectionFx, convertToTry } from '../domain/fx-convert';
import type {
  CorrectionCurrency,
  CorrectionDraft,
  CreateCorrectionDraftInput,
} from '../domain/correction-types';
import { validateReserveMax } from '../domain/reserve-guard';
import {
  findTransactionByNo,
  insertManualCorrectionTransaction,
  isManualCorrectionTransaction,
  updateManualCorrectionTransaction,
} from './mock-transactions-adapter';
import type { CorrectionsService } from './corrections-service';

const CURRENT_USER = 'current.user';
const APPROVAL_THRESHOLD_TRY = 100_000;

let correctionStore: CorrectionDraft[] = [];
let nextCorrectionId = 1;
let nextDocId = 5000;

function nowIso(): string {
  return new Date().toISOString();
}

function walletById(id: number | null) {
  if (id == null) return null;
  return getWallets().find((w) => w.id === id && w.recordStatus === 1) ?? null;
}

function walletCurrency(w: { ccy: string }): CorrectionCurrency {
  const c = w.ccy as CorrectionCurrency;
  return c === 'USD' || c === 'EUR' || c === 'GBP' ? c : 'TRY';
}

function validateDraftInput(input: CreateCorrectionDraftInput): string | null {
  const parsed = correctionFormSchema.safeParse({
    ...input,
    correctionReason: input.correctionReason || undefined,
  });
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return (first?.message as string) ?? 'cr_validation_failed';
  }
  if (input.sourceWalletId == null || input.targetWalletId == null) return 'cr_wallet_required';
  const source = walletById(input.sourceWalletId);
  const target = walletById(input.targetWalletId);
  if (!source || !target) return 'wd_not_found';
  const reserveErr = validateReserveMax(
    source.type,
    source.cat,
    input.requestedAmount,
    input.requestedCurrency,
  );
  if (reserveErr) return reserveErr;
  return null;
}

function toDraft(
  input: CreateCorrectionDraftInput,
  fx: ReturnType<typeof computeCorrectionFx>,
  draftTransactionId: number,
  id: number,
): CorrectionDraft {
  return {
    ...input,
    id,
    draftTransactionId,
    sourceOutAmount: fx.sourceOutAmount,
    targetInAmount: fx.targetInAmount,
    documentId: null,
    documentFileName: null,
    submittedToApproval: false,
    approvalId: null,
    createdBy: CURRENT_USER,
    createdAt: nowIso(),
  };
}

export const mockCorrectionsAdapter: CorrectionsService = {
  updateDraft(correctionId, input, role) {
    if (!getCorrectionPermissions(role).create) return { ok: false, error: 'td_permission_denied' };
    const existing = correctionStore.find((c) => c.id === correctionId);
    if (!existing) return { ok: false, error: 'cr_not_found' };
    if (existing.submittedToApproval) return { ok: false, error: 'cr_already_submitted' };

    const err = validateDraftInput(input);
    if (err) return { ok: false, error: err };

    const source = walletById(input.sourceWalletId)!;
    const target = walletById(input.targetWalletId)!;
    const fx = computeCorrectionFx(
      input.requestedAmount,
      input.requestedCurrency,
      walletCurrency(source),
      walletCurrency(target),
    );

    updateManualCorrectionTransaction(existing.draftTransactionId, {
      senderCustomerId: input.sourceCustomerId,
      senderAgentId: source.agentId,
      receiverCustomerId: input.targetCustomerId,
      receiverAgentId: target.agentId,
      senderWalletId: source.id,
      receiverWalletId: target.id,
      currency: source.ccy,
      targetCurrency: target.ccy,
      amount: fx.sourceOutAmount,
      targetAmount: fx.targetInAmount,
      paymentPurpose: input.correctionReason,
      description: input.transactionDescription || input.manualDescription,
      fxRate:
        source.ccy !== target.ccy
          ? Math.round((fx.sourceOutAmount / Math.max(fx.targetInAmount, 0.01)) * 10000) / 10000
          : null,
    });

    const draft = toDraft(input, fx, existing.draftTransactionId, correctionId);
    draft.documentId = existing.documentId;
    draft.documentFileName = existing.documentFileName;
    correctionStore = correctionStore.map((c) => (c.id === correctionId ? draft : c));
    return { ok: true, correctionId, transactionId: existing.draftTransactionId };
  },

  createDraft(input, role) {
    if (!getCorrectionPermissions(role).create) return { ok: false, error: 'td_permission_denied' };
    const err = validateDraftInput(input);
    if (err) return { ok: false, error: err };

    const source = walletById(input.sourceWalletId)!;
    const target = walletById(input.targetWalletId)!;
    const fx = computeCorrectionFx(
      input.requestedAmount,
      input.requestedCurrency,
      walletCurrency(source),
      walletCurrency(target),
    );

    const tx = insertManualCorrectionTransaction({
      senderCustomerId: input.sourceCustomerId,
      senderAgentId: source.agentId,
      receiverCustomerId: input.targetCustomerId,
      receiverAgentId: target.agentId,
      senderWalletId: source.id,
      receiverWalletId: target.id,
      senderIban: null,
      receiverIban: null,
      type: 'ManualCorrection',
      currency: source.ccy,
      targetCurrency: target.ccy,
      amount: fx.sourceOutAmount,
      targetAmount: fx.targetInAmount,
      status: 'Pending',
      recordStatus: 1,
      createdAt: nowIso(),
      paymentPurpose: input.correctionReason,
      description: input.transactionDescription || input.manualDescription,
      feeFixed: 0,
      feeVariable: 0,
      fxRate:
        source.ccy !== target.ccy
          ? Math.round((fx.sourceOutAmount / Math.max(fx.targetInAmount, 0.01)) * 10000) / 10000
          : null,
    });

    const id = nextCorrectionId++;
    const draft = toDraft(input, fx, tx.id, id);
    correctionStore = [...correctionStore, draft];
    return { ok: true, correctionId: id, transactionId: tx.id };
  },

  getDraft(correctionId, role) {
    if (!getCorrectionPermissions(role).view) return null;
    return correctionStore.find((c) => c.id === correctionId) ?? null;
  },

  attachDocument(correctionId, fileName, role) {
    if (!getCorrectionPermissions(role).create) return { ok: false, error: 'td_permission_denied' };
    const draft = correctionStore.find((c) => c.id === correctionId);
    if (!draft) return { ok: false, error: 'cr_not_found' };
    if (draft.documentId != null) return { ok: false, error: 'cr_doc_immutable' };
    const docId = nextDocId++;
    correctionStore = correctionStore.map((c) =>
      c.id === correctionId
        ? { ...c, documentId: docId, documentFileName: fileName }
        : c,
    );
    return { ok: true, documentId: docId };
  },

  submitToApproval(transactionId, role) {
    if (!getCorrectionPermissions(role).submit) return { ok: false, error: 'td_permission_denied' };
    if (!isManualCorrectionTransaction(transactionId)) {
      return { ok: false, error: 'cr_not_manual_tx' };
    }
    const draft = correctionStore.find((c) => c.draftTransactionId === transactionId);
    if (!draft) return { ok: false, error: 'cr_not_found' };
    if (draft.submittedToApproval && draft.approvalId) {
      return { ok: true, approvalId: draft.approvalId };
    }

    const tryEq = convertToTry(draft.requestedAmount, draft.requestedCurrency);
    const requiredApprovals: 1 | 2 = tryEq > APPROVAL_THRESHOLD_TRY ? 2 : 1;
    const user = getCurrentUser(role);
    const raw: CorrectionApprovalMeta = {
      correctionId: draft.id,
      transactionId,
      complaintId: draft.complaintId,
    };
    const enriched = enrichCorrectionApprovalPayload(draft, raw);

    const result = approvalsService.createRequest({
      screenKey: '5.2',
      screenName: 'İade / İptal / Düzeltme',
      initiatedBy: user,
      requiredApprovals,
      payload: {
        screenKey: '5.2',
        formKey: enriched.formKey,
        summary: `Manuel düzeltme ${draft.requestedAmount} ${draft.requestedCurrency}`,
        changes: enriched.changes,
        newValues: enriched.newValues,
        raw: raw as unknown as Record<string, unknown>,
      },
    });

    if (!result.ok || !result.approvalId) {
      return { ok: false, error: result.error ?? 'fx_approval_failed' };
    }

    correctionStore = correctionStore.map((c) =>
      c.draftTransactionId === transactionId
        ? { ...c, submittedToApproval: true, approvalId: result.approvalId! }
        : c,
    );
    return { ok: true, approvalId: result.approvalId };
  },

  lookupTransaction(txNo, role) {
    if (!getCorrectionPermissions(role).view) return null;
    return findTransactionByNo(txNo);
  },
};

export const correctionsService: CorrectionsService = mockCorrectionsAdapter;

export function __resetCorrectionStoreForTest() {
  correctionStore = [];
  nextCorrectionId = 1;
  nextDocId = 5000;
}

registerCorrectionApprovalApply(finalizeCorrectionOnApprove);

export function __getCorrectionStore() {
  return correctionStore;
}
