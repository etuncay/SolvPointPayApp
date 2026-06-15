import { isAllAccessRole, type BackOfficeRole } from '@epay/ui';

export type RiskScoreDefinitionPermissions = {
  canView: boolean;
  canEdit: boolean;
  canToggle: boolean;
  canSimulate: boolean;
};

/** Yalnızca compliance — plan 7.1 */
export function getRiskScoreDefinitionPermissions(
  role: BackOfficeRole,
): RiskScoreDefinitionPermissions {
  if (isAllAccessRole(role)) {
    return { canView: true, canEdit: true, canToggle: true, canSimulate: true };
  }
  const isCompliance = role === 'compliance';
  return {
    canView: isCompliance,
    canEdit: isCompliance,
    canToggle: isCompliance,
    canSimulate: isCompliance,
  };
}
