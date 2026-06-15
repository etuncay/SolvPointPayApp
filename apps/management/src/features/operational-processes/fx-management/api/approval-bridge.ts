import { approvalsService } from '@/features/approval-pool/api';
import { getCurrentUser } from '@/features/approval-pool/domain/current-user';
import type { ApprovalRequest } from '@/features/approval-pool/domain/types';
import type { BackOfficeRole } from '@epay/ui';
import type { FxMargin, FxMarginDraft, FxMarginRow } from '../domain/types';

export type FxMarginApprovalMeta = {
  draft: FxMarginDraft;
  previous: FxMarginRow[];
};

export function buildMarginChanges(previous: FxMarginRow[], draft: FxMarginDraft) {
  const changes: ApprovalRequest['payload']['changes'] = [];
  for (const next of draft.rows) {
    const old = previous.find((p) => p.currency === next.currency && p.workHours === next.workHours);
    if (!old) continue;
    const label = `${next.currency} / ${next.workHours}`;
    const fields: (keyof FxMarginRow)[] = [
      'buyFixedMargin',
      'buyVariableMarginPct',
      'sellFixedMargin',
      'sellVariableMarginPct',
      'roundingDecimals',
    ];
    for (const field of fields) {
      if (old[field] !== next[field]) {
        changes.push({
          field: `${next.currency}.${next.workHours}.${field}`,
          label: `${label} — ${field}`,
          oldValue: String(old[field]),
          newValue: String(next[field]),
        });
      }
    }
  }
  return changes;
}

export function createFxMarginApprovalRequest(
  previous: FxMargin[],
  draft: FxMarginDraft,
  role: BackOfficeRole,
): { ok: boolean; error?: string; approvalId?: number } {
  const user = getCurrentUser(role);
  const prevRows = previous.map(
    ({
      currency,
      workHours,
      buyFixedMargin,
      buyVariableMarginPct,
      sellFixedMargin,
      sellVariableMarginPct,
      roundingDecimals,
    }) => ({
      currency,
      workHours,
      buyFixedMargin,
      buyVariableMarginPct,
      sellFixedMargin,
      sellVariableMarginPct,
      roundingDecimals,
    }),
  );
  const changes = buildMarginChanges(prevRows, draft);
  const meta: FxMarginApprovalMeta = { draft, previous: prevRows };

  return approvalsService.createRequest({
    screenKey: 'fx_margin_change',
    screenName: 'FX Marj Değişikliği',
    initiatedBy: user,
    requiredApprovals: 1,
    payload: {
      screenKey: 'fx_margin_change',
      summary: `FX marj güncelleme — ${changes.length} alan`,
      changes,
      raw: meta as unknown as Record<string, unknown>,
    },
  });
}

export function parseFxMarginApprovalMeta(approval: ApprovalRequest): FxMarginApprovalMeta | null {
  if (approval.payload.screenKey !== 'fx_margin_change') return null;
  const raw = approval.payload.raw as FxMarginApprovalMeta | undefined;
  if (!raw?.draft?.rows?.length) return null;
  return raw;
}

export type FxMarginApprovalApplyFn = (approvalId: number) => void;

let applyHandler: FxMarginApprovalApplyFn | null = null;

export function registerFxMarginApprovalApply(fn: FxMarginApprovalApplyFn): void {
  applyHandler = fn;
}

export function applyFxMarginApprovalIfNeeded(approvalId: number): void {
  const approval = approvalsService.getById(approvalId);
  if (!approval || approval.uiStatus !== 'approved') return;
  if (approval.payload.screenKey !== 'fx_margin_change') return;
  applyHandler?.(approvalId);
}
