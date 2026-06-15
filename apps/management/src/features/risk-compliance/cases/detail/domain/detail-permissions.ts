import type { CompliancePersona } from './compliance-persona';
import type { CaseAction } from './types';

export type CaseDetailPermissions = {
  actions: CaseAction[];
  canApprove: boolean;
  canReject: boolean;
  canRoute: boolean;
  canException: boolean;
  canReport: boolean;
  actionsEnabled: boolean;
  requireManagerNote: boolean;
};

const OPERATOR_ACTIONS: CaseAction[] = ['approve', 'reject', 'route', 'exception'];
const MANAGER_ACTIONS: CaseAction[] = ['approve', 'reject', 'report'];

export function getCaseDetailPermissions(
  persona: CompliancePersona,
  opts: { isClosed: boolean; assignedToManager: boolean },
): CaseDetailPermissions {
  if (opts.isClosed) {
    return {
      actions: [],
      canApprove: false,
      canReject: false,
      canRoute: false,
      canException: false,
      canReport: false,
      actionsEnabled: false,
      requireManagerNote: false,
    };
  }

  const actions = persona === 'manager' ? MANAGER_ACTIONS : OPERATOR_ACTIONS;
  return {
    actions,
    canApprove: actions.includes('approve'),
    canReject: actions.includes('reject'),
    canRoute: actions.includes('route'),
    canException: actions.includes('exception'),
    canReport: actions.includes('report'),
    actionsEnabled: true,
    requireManagerNote: opts.assignedToManager,
  };
}
