import { isAllAccessRole, type BackOfficeRole } from '@epay/ui';

export type CorrectionPermissions = {
  view: boolean;
  create: boolean;
  submit: boolean;
};

/** Spec §3 — ops + management form; compliance/finance yok */
export function getCorrectionPermissions(role: BackOfficeRole): CorrectionPermissions {
  if (isAllAccessRole(role)) {
    return { view: true, create: true, submit: true };
  }
  switch (role) {
    case 'ops':
    case 'management':
      return { view: true, create: true, submit: true };
    default:
      return { view: false, create: false, submit: false };
  }
}
