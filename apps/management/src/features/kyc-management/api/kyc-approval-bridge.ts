import { approvalsService } from '@/features/approval-pool/api';
import { getCurrentUser } from '@/features/approval-pool/domain/current-user';
import type { ApprovalRequest } from '@/features/approval-pool/domain/types';
import type { BackOfficeRole } from '@epay/ui';

export type KycVerifyApprovalMeta = {
  reviewId: number;
  entityNo: string;
  displayName: string;
  riskScore: number;
  evaluationNote: string;
};

export function createKycVerifyApprovalRequest(
  meta: KycVerifyApprovalMeta,
  role: BackOfficeRole,
): { ok: boolean; error?: string; approvalId?: number } {
  const user = getCurrentUser(role);
  const created = approvalsService.createRequest({
    screenKey: 'kyc_verify',
    screenName: 'KYC Doğrulama',
    initiatedBy: user,
    requiredApprovals: 2,
    payload: {
      screenKey: 'kyc_verify',
      summary: `${meta.displayName} — KYC doğrulama (skor ${meta.riskScore})`,
      changes: [
        {
          field: 'riskScore',
          label: 'Risk skoru',
          oldValue: '—',
          newValue: String(meta.riskScore),
        },
        {
          field: 'evaluationNote',
          label: 'Değerlendirme notu',
          oldValue: '—',
          newValue: meta.evaluationNote,
        },
      ],
      raw: meta as unknown as Record<string, unknown>,
    },
  });
  if (!created.ok || created.approvalId == null) return created;
  // Maker-checker (§0.6): doğrulamayı başlatan uyum görevlisi kendi talebini onaylayamaz.
  // Onay, Onay Havuzu üzerinden farklı 1. ve 2. onaycılar tarafından verilir.
  return { ok: true, approvalId: created.approvalId };
}

export function parseKycVerifyApprovalMeta(approval: ApprovalRequest): KycVerifyApprovalMeta | null {
  if (approval.payload.screenKey !== 'kyc_verify') return null;
  const raw = approval.payload.raw as KycVerifyApprovalMeta | undefined;
  if (!raw?.reviewId) return null;
  return raw;
}

export type KycVerifyApprovalApplyFn = (approvalId: number) => void;

let applyHandler: KycVerifyApprovalApplyFn | null = null;

export function registerKycVerifyApprovalApply(fn: KycVerifyApprovalApplyFn): void {
  applyHandler = fn;
}

export function applyKycVerifyApprovalIfNeeded(approvalId: number): void {
  const approval = approvalsService.getById(approvalId);
  if (!approval || approval.uiStatus !== 'approved') return;
  if (approval.payload.screenKey !== 'kyc_verify') return;
  applyHandler?.(approvalId);
}
