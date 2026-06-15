import type { BackOfficeRole } from '@epay/ui';

/** 12.3 gelene kadar sabit rol listesi */
export const DOCUMENT_TYPE_ROLE_OPTIONS: BackOfficeRole[] = [
  'ops',
  'compliance',
  'finance',
  'management',
];

export const ROLE_I18N_KEYS: Record<BackOfficeRole, string> = {
  ops: 'nav_ops',
  compliance: 'scf_dept_compliance',
  finance: 'scf_dept_finance',
  management: 'dtf_role_management',
  alltest: 'auth_role_alltest',
};
