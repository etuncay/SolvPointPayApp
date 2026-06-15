import { isAllAccessRole, type BackOfficeRole } from '@epay/ui';

export type RiskLimitsPermissions = {
  canView: boolean;
  canSave: boolean;
};

/** Spec §3 — compliance + yönetim */
export function getRiskLimitsPermissions(role: BackOfficeRole): RiskLimitsPermissions {
  if (isAllAccessRole(role)) {
    return { canView: true, canSave: true };
  }
  const allowed = role === 'compliance' || role === 'management';
  return {
    canView: allowed,
    canSave: allowed,
  };
}
