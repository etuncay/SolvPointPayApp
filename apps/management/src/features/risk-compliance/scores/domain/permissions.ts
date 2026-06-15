import { isAllAccessRole, type BackOfficeRole } from '@epay/ui';

export type RiskScoresPermissions = {
  canView: boolean;
  canManualChange: boolean;
};

/** Yalnızca compliance — plan 7.3 §7 */
export function getRiskScoresPermissions(role: BackOfficeRole): RiskScoresPermissions {
  if (isAllAccessRole(role)) {
    return { canView: true, canManualChange: true };
  }
  const isCompliance = role === 'compliance';
  return {
    canView: isCompliance,
    canManualChange: isCompliance,
  };
}
