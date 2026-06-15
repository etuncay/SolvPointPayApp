import type { CaseGroup } from '@/features/risk-compliance/management/domain/types';
import {
  DEFAULT_MANAGER_GROUP_ID,
  DEFAULT_OPERATOR_GROUP_ID,
} from '@/features/risk-compliance/management/domain/reference-list-codes';

export const RM_CASE_GROUPS_SEED: CaseGroup[] = [
  {
    id: DEFAULT_OPERATOR_GROUP_ID,
    name: 'Operatörler',
    type: 'Operator',
    isDefault: true,
    memberIds: ['u.comp', 'u.comp2', 'u.comp3'],
  },
  {
    id: DEFAULT_MANAGER_GROUP_ID,
    name: 'Yöneticiler',
    type: 'Manager',
    isDefault: true,
    memberIds: ['u.mgmt', 'u.mgmt2'],
  },
  {
    id: 'GRP_CUSTOM_DEMO',
    name: 'Gece Vardiyası',
    type: 'Custom',
    isDefault: false,
    memberIds: ['u.comp3'],
  },
];
