import { isAllAccessRole, type BackOfficeRole } from '@epay/ui';

/** Spec §3 — liste yalnızca compliance + management */
export function canListDocumentTypes(role: BackOfficeRole): boolean {
  return role === 'compliance' || role === 'management' || isAllAccessRole(role);
}

/** 9.4 insert/update — aynı rol kümesi */
export function canMutateDocumentTypes(role: BackOfficeRole): boolean {
  return canListDocumentTypes(role);
}
