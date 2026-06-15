import { isAllAccessRole, type BackOfficeRole } from '@epay/ui';

export function getSupportReportPermissions(role: BackOfficeRole): { canView: boolean } {
  if (isAllAccessRole(role)) {
    return { canView: true };
  }
  return { canView: role === 'management' };
}
