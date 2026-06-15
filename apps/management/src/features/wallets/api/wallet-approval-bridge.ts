import type { BackOfficeRole } from '@epay/ui';
import { approvalsService } from '@/features/approval-pool/api';
import { getCurrentUser } from '@/features/approval-pool/domain/current-user';
import { buildApprovalChanges } from '@/features/approval-pool/domain/compute-changed-fields';
import type { ApprovalRequest } from '@/features/approval-pool/domain/types';
import { buildWalletDetailFormConfig } from '../wallet-detail-form-config';
import type { WalletLimitSet } from '../domain/detail-types';
import { walletLimitsToFlat } from '../domain/wallet-limits-to-flat';

export type WalletLimitApprovalMeta = {
  walletId: number;
  limits: WalletLimitSet;
  role: BackOfficeRole;
};

export function createWalletLimitApprovalRequest(
  input: {
    walletId: number;
    newLimits: WalletLimitSet;
    oldLimits: WalletLimitSet;
    role: BackOfficeRole;
    requiredApprovals: 1 | 2;
  },
): { ok: boolean; error?: string; approvalId?: number } {
  const user = getCurrentUser(input.role);
  const newValues = walletLimitsToFlat(input.newLimits);
  const oldValues = walletLimitsToFlat(input.oldLimits);
  const config = buildWalletDetailFormConfig();
  const meta: WalletLimitApprovalMeta = {
    walletId: input.walletId,
    limits: input.newLimits,
    role: input.role,
  };
  return approvalsService.createRequest({
    screenKey: 'wallet_detail',
    screenName: 'Cüzdan Limit Değişikliği',
    initiatedBy: user,
    requiredApprovals: input.requiredApprovals,
    payload: {
      screenKey: 'wallet_detail',
      formKey: 'wallet_detail',
      summary: `Cüzdan #${input.walletId} — limit güncelleme`,
      changes: buildApprovalChanges(config, newValues, oldValues),
      newValues,
      oldValues,
      raw: meta as unknown as Record<string, unknown>,
    },
  });
}

export function parseWalletLimitApprovalMeta(approval: ApprovalRequest): WalletLimitApprovalMeta | null {
  if (approval.payload.screenKey !== 'wallet_detail') return null;
  const raw = approval.payload.raw as WalletLimitApprovalMeta | undefined;
  if (!raw?.limits || raw.walletId == null) return null;
  return raw;
}

export type WalletLimitApprovalApplyFn = (meta: WalletLimitApprovalMeta) => void;

let applyHandler: WalletLimitApprovalApplyFn | null = null;

export function registerWalletLimitApprovalApply(fn: WalletLimitApprovalApplyFn): void {
  applyHandler = fn;
}

export function applyWalletLimitApprovalIfNeeded(approvalId: number): void {
  const approval = approvalsService.getById(approvalId);
  if (!approval || approval.uiStatus !== 'approved') return;
  const meta = parseWalletLimitApprovalMeta(approval);
  if (!meta) return;
  applyHandler?.(meta);
}
