import { getCurrentUser } from '@/features/approval-pool/domain/current-user';
import type { BackOfficeRole } from '@epay/ui';

const ROLES: BackOfficeRole[] = ['ops', 'compliance', 'management', 'finance'];

export const STAFF_OPTIONS = ROLES.map((role) => {
  const u = getCurrentUser(role);
  return { id: u.id, label: u.displayName, role };
});
