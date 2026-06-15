import type { BackOfficeRole } from '@epay/ui';
import { approvalsService } from '@/features/approval-pool/api';
import { getCurrentUser } from '@/features/approval-pool/domain/current-user';
import { resolveRequiredApprovals } from '@/features/approval-pool/domain/resolve-required-approvals';
import type { ApprovalRequest, PayloadChange } from '@/features/approval-pool/domain/types';
import type { RiskBasedLimitRow } from '../domain/types';

export type RiskLimitApprovalMeta = {
  rows: RiskBasedLimitRow[];
  role: BackOfficeRole;
};

function rowKey(row: RiskBasedLimitRow): string {
  return `${row.entityType}:${row.riskLevel ?? 'global'}`;
}

function buildRiskLimitChanges(
  oldRows: RiskBasedLimitRow[],
  newRows: RiskBasedLimitRow[],
): PayloadChange[] {
  const oldByKey = new Map(oldRows.map((r) => [rowKey(r), r]));
  const changes: PayloadChange[] = [];

  for (const row of newRows) {
    const key = rowKey(row);
    const prev = oldByKey.get(key);
    if (!prev) {
      changes.push({
        field: key,
        label: key,
        oldValue: '—',
        newValue: JSON.stringify(row),
      });
      continue;
    }
    const fields: (keyof RiskBasedLimitRow)[] = [
      'singleTxLimit',
      'dailyLimit',
      'monthlyLimit',
      'singleTxApprovalThreshold',
      'internationalTransfer',
    ];
    for (const field of fields) {
      if (prev[field] !== row[field]) {
        changes.push({
          field: `${key}.${field}`,
          label: `${key}.${field}`,
          oldValue: String(prev[field]),
          newValue: String(row[field]),
        });
      }
    }
  }

  return changes;
}

export function createRiskLimitApprovalRequest(input: {
  rows: RiskBasedLimitRow[];
  oldRows: RiskBasedLimitRow[];
  role: BackOfficeRole;
}): { ok: boolean; error?: string; approvalId?: number } {
  const user = getCurrentUser(input.role);
  const meta: RiskLimitApprovalMeta = {
    rows: input.rows.map((r) => ({ ...r })),
    role: input.role,
  };
  return approvalsService.createRequest({
    screenKey: 'risk_based_limits',
    screenName: 'Risk Bazlı Limit Versiyonu',
    initiatedBy: user,
    requiredApprovals: resolveRequiredApprovals('risk_based_limits'),
    payload: {
      screenKey: 'risk_based_limits',
      summary: `Risk limit matrisi — ${input.rows.length} satır`,
      changes: buildRiskLimitChanges(input.oldRows, input.rows),
      newValues: { rowCount: input.rows.length },
      oldValues: { rowCount: input.oldRows.length },
      raw: meta as unknown as Record<string, unknown>,
    },
  });
}

export function parseRiskLimitApprovalMeta(approval: ApprovalRequest): RiskLimitApprovalMeta | null {
  if (approval.payload.screenKey !== 'risk_based_limits') return null;
  const raw = approval.payload.raw as RiskLimitApprovalMeta | undefined;
  if (!raw?.rows?.length) return null;
  return raw;
}

export type RiskLimitApprovalApplyFn = (meta: RiskLimitApprovalMeta) => void;

let applyHandler: RiskLimitApprovalApplyFn | null = null;

export function registerRiskLimitApprovalApply(fn: RiskLimitApprovalApplyFn): void {
  applyHandler = fn;
}

export function applyRiskLimitApprovalIfNeeded(approvalId: number): void {
  const approval = approvalsService.getById(approvalId);
  if (!approval || approval.uiStatus !== 'approved') return;
  const meta = parseRiskLimitApprovalMeta(approval);
  if (!meta) return;
  applyHandler?.(meta);
}
