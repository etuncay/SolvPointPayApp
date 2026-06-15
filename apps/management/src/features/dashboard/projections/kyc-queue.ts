import { kycReviewsService } from '@/features/kyc-management/api';
import type { BackOfficeRole } from '@epay/ui';
import type { KycRow } from '../domain/types';

function reviewAgeHours(queryTime: string): number {
  const ms = Date.now() - new Date(queryTime).getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60)));
}

/** KYC manuel doğrulama kuyruğu — inQueue kayıtlar. */
export function projectKycQueue(role: BackOfficeRole): KycRow[] {
  return kycReviewsService.list(role).map((r) => ({
    id: `KYC-${String(r.id).padStart(5, '0')}`,
    customer: r.displayName,
    reason: r.blockageReason ?? r.queryResultLabel,
    age: reviewAgeHours(r.queryTime),
    level: r.kycStatusDisplay,
    risk: r.entityStatus === 'blocked' ? 'high' : 'med',
  }));
}
