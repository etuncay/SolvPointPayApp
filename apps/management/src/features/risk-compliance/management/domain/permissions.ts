import { isAllAccessRole, type BackOfficeRole } from '@epay/ui';

export type RiskManagementPermissions = {
  view: boolean;
  update: boolean;
};

export function getRiskManagementPermissions(role: BackOfficeRole): RiskManagementPermissions {
  if (isAllAccessRole(role)) {
    return { view: true, update: true };
  }
  const allowed = role === 'compliance' || role === 'management';
  return {
    view: allowed,
    update: allowed,
  };
}
