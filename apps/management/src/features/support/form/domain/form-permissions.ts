import type { BackOfficeRole } from '@epay/ui';
import type { CaseStatus, SupportCase } from '../../domain/types';
import { getSupportCasePermissions } from '../../domain/permissions';
import { isOpenCaseStatus } from '../../domain/case-status-ui';

export type ActionButtonId =
  | 'attach'
  | 'save'
  | 'take'
  | 'transfer'
  | 'contact'
  | 'infoRequest'
  | 'resolve'
  | 'reject'
  | 'reopen';

export function canPerformCaseAction(
  role: BackOfficeRole,
  userId: string,
  supportCase: SupportCase | null,
): boolean {
  if (!supportCase) return getSupportCasePermissions(role).insert;
  const perms = getSupportCasePermissions(role);
  if (!perms.list) return false;
  if (perms.viewAll) return true;
  return (
    supportCase.ownerUserId === userId ||
    (supportCase.departmentId != null && role === supportCase.departmentId)
  );
}

export function visibleActionButtons(
  mode: 'new' | 'edit',
  caseStatus: CaseStatus | null,
  permissions: { insert: boolean; canAct: boolean },
  isReconciliationLocked: boolean,
): ActionButtonId[] {
  if (mode === 'new') {
    return permissions.insert ? ['save'] : [];
  }
  if (!permissions.canAct || !caseStatus) return [];
  if (isReconciliationLocked) {
    return isOpenCaseStatus(caseStatus) ? ['attach', 'resolve', 'reject'] : ['reopen'];
  }
  if (!isOpenCaseStatus(caseStatus)) return ['reopen'];
  return ['attach', 'take', 'transfer', 'contact', 'infoRequest', 'resolve', 'reject'];
}
