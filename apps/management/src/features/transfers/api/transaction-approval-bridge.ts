import type { BackOfficeRole } from '@epay/ui';
import { approvalsService } from '@/features/approval-pool/api';
import { getCurrentUser } from '@/features/approval-pool/domain/current-user';
import { computeChangedFields } from '@/features/approval-pool/domain/compute-changed-fields';
import { resolveRequiredApprovals } from '@/features/approval-pool/domain/resolve-required-approvals';
import type { ApprovalRequest, PayloadChange } from '@/features/approval-pool/domain/types';
import type { Transaction } from '../domain/types';

export type TransactionApprovalMeta = {
  transactionId: number;
  txNo: string;
  action: 'generic_submit';
};

function transactionToValues(tx: Transaction): Record<string, unknown> {
  return {
    txNo: tx.txNo,
    type: tx.type,
    status: tx.status,
    amount: tx.amount,
    currency: tx.currency,
    targetAmount: tx.targetAmount,
    targetCurrency: tx.targetCurrency,
    paymentPurpose: tx.paymentPurpose ?? '',
    description: tx.description ?? '',
  };
}

const TX_LABELS: Record<string, string> = {
  txNo: 'İşlem No',
  type: 'Tip',
  status: 'Durum',
  amount: 'Tutar',
  currency: 'PB',
  targetAmount: 'Hedef Tutar',
  targetCurrency: 'Hedef PB',
  paymentPurpose: 'Amaç',
  description: 'Açıklama',
};

function buildTxChanges(newValues: Record<string, unknown>): PayloadChange[] {
  return computeChangedFields(newValues, undefined).map((field) => ({
    field,
    label: TX_LABELS[field] ?? field,
    oldValue: '—',
    newValue: newValues[field] != null ? String(newValues[field]) : '—',
  }));
}

export function createTransactionApprovalRequest(
  tx: Transaction,
  role: BackOfficeRole,
): { ok: boolean; error?: string; approvalId?: number } {
  const user = getCurrentUser(role);
  const newValues = transactionToValues(tx);
  const meta: TransactionApprovalMeta = {
    transactionId: tx.id,
    txNo: tx.txNo,
    action: 'generic_submit',
  };
  return approvalsService.createRequest({
    screenKey: 'transaction_detail',
    screenName: 'İşlem Onayı',
    initiatedBy: user,
    requiredApprovals: resolveRequiredApprovals('transaction_detail'),
    payload: {
      screenKey: 'transaction_detail',
      summary: `${tx.txNo} — ${tx.type}`,
      changes: buildTxChanges(newValues),
      newValues,
      raw: meta as unknown as Record<string, unknown>,
    },
  });
}

export function parseTransactionApprovalMeta(approval: ApprovalRequest): TransactionApprovalMeta | null {
  if (approval.payload.screenKey !== 'transaction_detail') return null;
  const raw = approval.payload.raw as TransactionApprovalMeta | undefined;
  if (!raw?.transactionId) return null;
  return raw;
}

export type TransactionApprovalApplyFn = (meta: TransactionApprovalMeta) => void;

let applyHandler: TransactionApprovalApplyFn | null = null;

export function registerTransactionApprovalApply(fn: TransactionApprovalApplyFn): void {
  applyHandler = fn;
}

export function applyTransactionApprovalIfNeeded(approvalId: number): void {
  const approval = approvalsService.getById(approvalId);
  if (!approval || approval.uiStatus !== 'approved') return;
  const meta = parseTransactionApprovalMeta(approval);
  if (!meta) return;
  applyHandler?.(meta);
}
