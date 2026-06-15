import type { CaseGroup } from './types';
import { DEFAULT_MANAGER_GROUP_ID, DEFAULT_OPERATOR_GROUP_ID } from './reference-list-codes';

export function findOperatorManagerOverlap(groups: CaseGroup[]): string[] {
  const ops = groups.find((g) => g.id === DEFAULT_OPERATOR_GROUP_ID)?.memberIds ?? [];
  const mgrs = groups.find((g) => g.id === DEFAULT_MANAGER_GROUP_ID)?.memberIds ?? [];
  const opSet = new Set(ops);
  return mgrs.filter((id) => opSet.has(id));
}

export function assertNoOperatorManagerOverlap(groups: CaseGroup[]): { ok: true } | { ok: false; error: string } {
  const overlap = findOperatorManagerOverlap(groups);
  if (overlap.length > 0) return { ok: false, error: 'rm_group_overlap' };
  return { ok: true };
}

export function canDeleteGroup(group: CaseGroup): boolean {
  return !group.isDefault;
}

export function assertGroupsSaveable(groups: CaseGroup[]): { ok: true } | { ok: false; error: string } {
  const overlap = assertNoOperatorManagerOverlap(groups);
  if (!overlap.ok) return overlap;
  const hasOperators = groups.find((g) => g.id === DEFAULT_OPERATOR_GROUP_ID);
  const hasManagers = groups.find((g) => g.id === DEFAULT_MANAGER_GROUP_ID);
  if (!hasOperators || !hasManagers) {
    return { ok: false, error: 'rm_default_group_delete' };
  }
  return { ok: true };
}
