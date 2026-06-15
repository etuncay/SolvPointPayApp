import { approvalsService } from '@/features/approval-pool/api';
import { getCurrentUser } from '@/features/approval-pool/domain/current-user';
import type { BackOfficeRole } from '@epay/ui';
import type { ApprovalRequest } from '@/features/approval-pool/domain/types';
import type { FraudRiskSource, ManualChangeInput } from '../domain/types';

export type RiskScoreApprovalMeta = {
  source: FraudRiskSource;
  entityId: string;
  entityKey: string;
  displayName: string;
  oldScore: number;
  newScore: number;
  reason: string;
};

export function createRiskScoreApprovalRequest(
  meta: RiskScoreApprovalMeta,
  role: BackOfficeRole,
): { ok: boolean; error?: string; approvalId?: number } {
  const user = getCurrentUser(role);
  return approvalsService.createRequest({
    screenKey: 'risk_manual_score',
    screenName: 'Manuel Risk Skoru',
    initiatedBy: user,
    requiredApprovals: 1,
    payload: {
      screenKey: 'risk_manual_score',
      summary: `${meta.displayName} — skor ${meta.oldScore} → ${meta.newScore}`,
      changes: [
        {
          field: 'score',
          label: 'Risk skoru',
          oldValue: String(meta.oldScore),
          newValue: String(meta.newScore),
        },
        {
          field: 'reason',
          label: 'Gerekçe',
          oldValue: '—',
          newValue: meta.reason,
        },
      ],
      raw: meta as unknown as Record<string, unknown>,
    },
  });
}

export function parseRiskScoreApprovalMeta(
  approval: ApprovalRequest,
): RiskScoreApprovalMeta | null {
  if (approval.payload.screenKey !== 'risk_manual_score') return null;
  const raw = approval.payload.raw as RiskScoreApprovalMeta | undefined;
  if (!raw?.entityKey || raw.newScore == null) return null;
  return raw;
}

/** Onay sonrası skor güncellemesi — mock-approvals-adapter approve hook */
export type RiskScoreApprovalApplyFn = (approvalId: number) => void;

let applyHandler: RiskScoreApprovalApplyFn | null = null;

export function registerRiskScoreApprovalApply(fn: RiskScoreApprovalApplyFn): void {
  applyHandler = fn;
}

export function applyRiskScoreApprovalIfNeeded(approvalId: number): void {
  const approval = approvalsService.getById(approvalId);
  if (!approval || approval.uiStatus !== 'approved') return;
  if (approval.payload.screenKey !== 'risk_manual_score') return;
  applyHandler?.(approvalId);
}
