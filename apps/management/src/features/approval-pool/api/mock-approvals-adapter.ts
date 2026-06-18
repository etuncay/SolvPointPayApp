import { applyAgentApprovalIfNeeded } from '@/features/agent-form/api/agent-approval-bridge';
import { applyAgentFeeApprovalIfNeeded } from '@/features/agent-fees/api/agent-fee-approval-bridge';
import { applyAuthorizedPersonApprovalIfNeeded } from '@/features/authorized-person-form/api/authorized-person-approval-bridge';
import { applyCorporateApprovalIfNeeded } from '@/features/corporate-form/api/corporate-approval-bridge';
import { applyCustomerFeeApprovalIfNeeded } from '@/features/customer-fees/api/customer-fee-approval-bridge';
import { applyIndividualApprovalIfNeeded } from '@/features/individual-form/api/individual-approval-bridge';
import { applyRiskLimitApprovalIfNeeded } from '@/features/risk-compliance/limits/api/risk-limit-approval-bridge';
import { applyRiskManagementApprovalIfNeeded } from '@/features/risk-compliance/management/api/risk-management-approval-bridge';
import { applyCorrectionApprovalIfNeeded } from '@/features/transfers/api/correction-approval-bridge';
import { applyTransactionApprovalIfNeeded } from '@/features/transfers/api/transaction-approval-bridge';
import { applyWalletLimitApprovalIfNeeded } from '@/features/wallets/api/wallet-approval-bridge';
import { applyKycVerifyApprovalIfNeeded } from '@/features/kyc-management/api/kyc-approval-bridge';
import {
  applyLeaveApprovalIfNeeded,
  registerLeaveApprovalLookup,
} from '@/features/hr/leave-form/domain/leave-approval-finalize';
import { applyFxMarginApprovalIfNeeded } from '@/features/operational-processes/fx-management/api/approval-bridge';
import { applyRiskScoreApprovalIfNeeded } from '@/features/risk-compliance/scores/api/approval-bridge';
import { applyParameterApprovalIfNeeded } from '@/features/system/parameters/api/parameter-approval-bridge';
import { sendTemplate } from '@/features/system/notifications';
import { APPROVAL_REQUESTS } from '@/mocks/approval-requests';
import { deriveUiStatus } from '../domain/ui-status';
import {
  applyApprove,
  applyReject,
  applyWithdraw,
  isAwaitingFirst,
  isAwaitingSecond,
} from '../domain/transitions';
import type { ApprovalsService, CreateApprovalRequestInput } from './approvals-service';
import type { ApprovalListFilter, ApprovalRequest, CurrentUser } from '../domain/types';
import { userIdsMatch } from '../domain/current-user';
import { MOCK_USER_IDS } from '../domain/types';

let store: ApprovalRequest[] = APPROVAL_REQUESTS.map((r) => ({ ...r }));
let nextId = 1000;

registerLeaveApprovalLookup((id) => store.find((r) => r.id === id) ?? null);

function sortDesc(rows: ApprovalRequest[]) {
  return [...rows].sort(
    (a, b) => new Date(b.initiatedAt).getTime() - new Date(a.initiatedAt).getTime(),
  );
}

function isActive(r: ApprovalRequest) {
  return !['superseded', 'canceled'].includes(r.uiStatus);
}

function matchesPendingMine(r: ApprovalRequest, user: CurrentUser): boolean {
  if (!isActive(r) || r.uiStatus === 'withdrawn') return false;
  if (isAwaitingSecond(r)) return user.canSecondApprove;
  if (isAwaitingFirst(r)) return user.canFirstApprove;
  return false;
}

function matchesInitiatedMine(r: ApprovalRequest, user: CurrentUser): boolean {
  return userIdsMatch(user.id, r.initiatedBy) && isActive(r);
}

function matchesApprovedMine(r: ApprovalRequest, user: CurrentUser): boolean {
  if (userIdsMatch(user.id, r.firstApprover ?? '') && r.firstStatus === 'Approved') return true;
  if (userIdsMatch(user.id, r.secondApprover ?? '') && r.secondStatus === 'Approved') return true;
  return false;
}

function matchesRejectedMine(r: ApprovalRequest, user: CurrentUser): boolean {
  if (userIdsMatch(user.id, r.firstApprover ?? '') && r.firstStatus === 'Rejected') return true;
  if (userIdsMatch(user.id, r.secondApprover ?? '') && r.secondStatus === 'Rejected') return true;
  return false;
}

function filterRows(filter: ApprovalListFilter, user: CurrentUser): ApprovalRequest[] {
  const all = sortDesc(store.filter(isActive));
  switch (filter) {
    case 'pending_mine':
      return all.filter((r) => matchesPendingMine(r, user));
    case 'initiated_mine':
      return all.filter((r) => matchesInitiatedMine(r, user));
    case 'approved_mine':
      return all.filter((r) => matchesApprovedMine(r, user));
    case 'rejected_mine':
      return all.filter((r) => matchesRejectedMine(r, user));
    case 'all':
    default:
      return all;
  }
}

function persist(updated: ApprovalRequest) {
  updated.uiStatus = deriveUiStatus(updated);
  const idx = store.findIndex((r) => r.id === updated.id);
  if (idx >= 0) store[idx] = updated;
}

export const mockApprovalsAdapter: ApprovalsService = {
  list(filter, user) {
    return filterRows(filter, user);
  },

  getById(id) {
    return store.find((r) => r.id === id) ?? null;
  },

  countPendingForUser(user) {
    return filterRows('pending_mine', user).length;
  },

  createRequest(input: CreateApprovalRequestInput) {
    const id = nextId++;
    const rec: ApprovalRequest = {
      id,
      referenceNo: `APR-${String(id).padStart(6, '0')}`,
      screenName: input.screenName,
      payload: input.payload,
      requiredApprovals: input.requiredApprovals,
      initiatedBy: input.initiatedBy.id,
      initiatedByName: input.initiatedBy.displayName,
      initiatedAt: new Date().toISOString(),
      firstApprover: null,
      firstApproverName: null,
      firstApprovalAt: null,
      firstStatus: 'Pending',
      secondApprover: input.requiredApprovals === 2 ? MOCK_USER_IDS.management : null,
      secondApproverName: input.requiredApprovals === 2 ? 'Mehmet Şahin' : null,
      secondApprovalAt: null,
      secondStatus: input.requiredApprovals === 2 ? null : null,
      uiStatus: 'awaiting_first',
      previousApprovalRef: null,
      comment: null,
      lastActionBy: input.initiatedBy.id,
    };
    rec.uiStatus = deriveUiStatus(rec);
    store.push(rec);
    return { ok: true, approvalId: id };
  },

  approve(id, user, comment) {
    const existing = store.find((r) => r.id === id);
    if (!existing) return { ok: false, error: 'finrec_not_found' };
    const result = applyApprove(existing, user, comment);
    if (result.ok && result.record) {
      persist(result.record);
      applyRiskScoreApprovalIfNeeded(id);
      applyFxMarginApprovalIfNeeded(id);
      applyKycVerifyApprovalIfNeeded(id);
      applyLeaveApprovalIfNeeded(id);
      applyIndividualApprovalIfNeeded(id);
      applyCorporateApprovalIfNeeded(id);
      applyAgentApprovalIfNeeded(id);
      applyAuthorizedPersonApprovalIfNeeded(id);
      applyWalletLimitApprovalIfNeeded(id);
      applyCustomerFeeApprovalIfNeeded(id);
      applyAgentFeeApprovalIfNeeded(id);
      applyCorrectionApprovalIfNeeded(id);
      applyTransactionApprovalIfNeeded(id);
      applyRiskManagementApprovalIfNeeded(id);
      applyRiskLimitApprovalIfNeeded(id);
      applyParameterApprovalIfNeeded(id);
      if (isAwaitingFirst(existing)) {
        void sendTemplate({
          templateIdOrName: 'approval_pending',
          recipientAddress: 'ops@epay.local',
          recipientDisplayName: user.displayName,
          params: { kullanici_adi: user.displayName, islem_no: String(id) },
          triggeredBy: user.id,
        }).catch(() => undefined);
      }
    }
    return result;
  },

  reject(id, user, comment) {
    const existing = store.find((r) => r.id === id);
    if (!existing) return { ok: false, error: 'finrec_not_found' };
    const result = applyReject(existing, user, comment);
    if (result.ok && result.record) {
      persist(result.record);
      applyLeaveApprovalIfNeeded(id);
    }
    return result;
  },

  withdraw(id, user) {
    const existing = store.find((r) => r.id === id);
    if (!existing) return { ok: false, error: 'finrec_not_found' };
    const result = applyWithdraw(existing, user);
    if (result.ok && result.record) {
      persist(result.record);
      applyLeaveApprovalIfNeeded(id);
    }
    return result;
  },

  resubmit(id, user) {
    const existing = store.find((r) => r.id === id);
    if (!existing) return { ok: false, error: 'finrec_not_found' };
    // §0.6 — geri çekilmiş VEYA reddedilmiş talep, başlatan tarafından düzenlenip
    // yeniden gönderilebilir; önceki kayıt Superseded olur.
    const resubmittable: ApprovalRequest['uiStatus'][] = ['withdrawn', 'rejected', 'second_rejected'];
    if (!resubmittable.includes(existing.uiStatus) || !userIdsMatch(user.id, existing.initiatedBy)) {
      return { ok: false, error: 'fx_forbidden' };
    }
    const superseded: ApprovalRequest = { ...existing, uiStatus: 'superseded' };
    persist(superseded);

    const newRec: ApprovalRequest = {
      ...existing,
      id: nextId++,
      referenceNo: `APR-${String(nextId).padStart(6, '0')}`,
      firstStatus: 'Pending',
      firstApprover: null,
      firstApproverName: null,
      firstApprovalAt: null,
      secondStatus: existing.requiredApprovals === 2 ? null : null,
      secondApprovalAt: null,
      secondApprover: existing.requiredApprovals === 2 ? existing.secondApprover : null,
      secondApproverName: existing.requiredApprovals === 2 ? existing.secondApproverName : null,
      uiStatus: 'awaiting_first',
      previousApprovalRef: existing.id,
      comment: null,
      initiatedAt: new Date().toISOString(),
      lastActionBy: user.id,
    };
    if (newRec.requiredApprovals === 2) newRec.secondStatus = null;
    newRec.uiStatus = deriveUiStatus(newRec);
    store.push(newRec);
    return { ok: true, id: newRec.id };
  },
};

export function resetApprovalsStore(): void {
  store = APPROVAL_REQUESTS.map((r) => ({ ...r }));
  nextId = 1000;
}

export function getApprovalsStoreSnapshot(): ApprovalRequest[] {
  return store.map((r) => ({ ...r }));
}

/** Dashboard widget — bekleyen onay satırları */
export function pendingApprovalWidgetRows(user: CurrentUser) {
  return filterRows('pending_mine', user).slice(0, 8).map((r) => ({
    id: r.referenceNo,
    type: r.screenName,
    typeCode: r.payload.screenKey,
    requester: r.initiatedByName,
    age: Math.max(
      0,
      Math.floor((Date.now() - new Date(r.initiatedAt).getTime()) / (1000 * 60 * 60)),
    ),
    priority: (r.requiredApprovals === 2 ? 'high' : 'med') as 'high' | 'med' | 'low',
    amount: r.payload.changes.find((c) => c.field === 'amount')
      ? Number(r.payload.changes.find((c) => c.field === 'amount')!.newValue.replace(/\./g, ''))
      : null,
  }));
}
