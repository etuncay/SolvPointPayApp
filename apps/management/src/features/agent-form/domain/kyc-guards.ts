import type { AuthorizedPersonRow, ShareholderRow } from '@/mocks/sample-corporate';

function parseKycLevel(level: string): number {
  const m = level.match(/L(\d+)/i);
  return m ? parseInt(m[1]!, 10) : 0;
}

/** Spec §8 — tüm aktif yetkililer kyc_level ≥ 2 */
export function assertAuthorizedKycLevel(authorized: AuthorizedPersonRow[]): string | null {
  const active = authorized.filter((a) => a.status === 'active');
  if (active.length === 0) return 'af_auth_required';
  for (const a of active) {
    if (parseKycLevel(a.kycLevel) < 2) return 'af_auth_kyc_low';
  }
  return null;
}

/** Spec §8 — en az bir UBO; %25+ bireysel ortakta UBO zorunlu */
export function assertUboPresent(shareholders: ShareholderRow[]): string | null {
  const active = shareholders.filter((sh) => sh.status === 'active');
  const hasMarkedUbo = active.some((sh) => sh.isUbo);
  if (hasMarkedUbo) return null;

  const needsUbo = active.some(
    (sh) => sh.partyType === 'individual' && sh.directShare + sh.indirectShare >= 25,
  );
  if (needsUbo || active.length > 0) return 'af_ubo_missing';
  return 'af_ubo_missing';
}
