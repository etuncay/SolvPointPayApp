import { isAllAccessRole, type BackOfficeRole } from '@epay/ui';
import type { CampaignPermissions } from './types';

/** Spec §3 — pazarlama/fiyatlandırma → finance */
export function getCampaignPermissions(role: BackOfficeRole): CampaignPermissions {
  if (isAllAccessRole(role)) {
    return { list: true, insert: true, update: true, export: true };
  }
  switch (role) {
    case 'finance':
      return { list: true, insert: true, update: true, export: true };
    case 'ops':
      return { list: true, insert: false, update: false, export: true };
    default:
      return { list: true, insert: false, update: false, export: false };
  }
}
