import { describe, expect, it } from 'vitest';
import { assertGroupsSaveable, canDeleteGroup } from './group-guards';
import type { CaseGroup } from './types';
import { DEFAULT_MANAGER_GROUP_ID, DEFAULT_OPERATOR_GROUP_ID } from './reference-list-codes';

const baseGroups: CaseGroup[] = [
  { id: DEFAULT_OPERATOR_GROUP_ID, name: 'Ops', type: 'Operator', isDefault: true, memberIds: ['a'] },
  { id: DEFAULT_MANAGER_GROUP_ID, name: 'Mgr', type: 'Manager', isDefault: true, memberIds: ['b'] },
];

describe('group-guards', () => {
  it('overlap fail', () => {
    const groups = [
      { ...baseGroups[0]!, memberIds: ['x'] },
      { ...baseGroups[1]!, memberIds: ['x'] },
    ];
    expect(assertGroupsSaveable(groups)).toEqual({ ok: false, error: 'rm_group_overlap' });
  });

  it('default delete fail — missing default group', () => {
    expect(assertGroupsSaveable([baseGroups[0]!])).toEqual({ ok: false, error: 'rm_default_group_delete' });
  });

  it('default group not deletable', () => {
    expect(canDeleteGroup(baseGroups[0]!)).toBe(false);
    expect(canDeleteGroup({ ...baseGroups[0]!, isDefault: false, id: 'x' })).toBe(true);
  });
});
