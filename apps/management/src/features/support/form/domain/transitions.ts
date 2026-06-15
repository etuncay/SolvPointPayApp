import type {
  CaseAction,
  CaseStatus,
  ContactedParty,
  Level,
} from '../../domain/types';

export type ActionKind =
  | 'take'
  | 'transfer'
  | 'contact'
  | 'infoRequest'
  | 'resolve'
  | 'reject'
  | 'reopen';

export type ActionApplyInput = {
  kind: ActionKind;
  performedBy: string;
  performedByName: string;
  note: string;
  ownerUserId?: string;
  departmentId?: string;
  contactedParty?: ContactedParty;
  channel?: string;
  resolutionCode?: CaseStatus;
  reopenReason?: string;
};

export type ActionApplyResult = {
  caseStatus: CaseStatus;
  lastAction: CaseAction;
  ownerUserId: string | null;
  departmentId: string | null;
  closedAt: string | null;
  logAction: CaseAction;
  logNote: string;
  actionLabelKey: string;
};

function waitingStatusForParty(party: ContactedParty): CaseStatus {
  if (party === 'customer') return 'WaitingForCustomer';
  if (party === 'agent') return 'WaitingForAgent';
  return 'WaitingFor3rdParty';
}

export function applyCaseAction(
  current: {
    caseStatus: CaseStatus;
    ownerUserId: string | null;
    departmentId: string | null;
  },
  input: ActionApplyInput,
): ActionApplyResult {
  const now = new Date('2026-05-24T12:00:00Z').toISOString();

  switch (input.kind) {
    case 'take':
      return {
        caseStatus: 'Assigned',
        lastAction: 'Assignment',
        ownerUserId: input.performedBy,
        departmentId: current.departmentId,
        closedAt: null,
        logAction: 'Assignment',
        logNote: input.note || 'Üzerime alındı',
        actionLabelKey: 'scf_action_take',
      };
    case 'transfer': {
      const owner = input.ownerUserId?.trim() || current.ownerUserId;
      const dept = input.departmentId?.trim() || current.departmentId;
      return {
        caseStatus: 'Escalated',
        lastAction: 'Escalation',
        ownerUserId: owner,
        departmentId: dept,
        closedAt: null,
        logAction: 'Escalation',
        logNote: input.note,
        actionLabelKey: 'scf_action_transfer',
      };
    }
    case 'contact':
      return {
        caseStatus: current.caseStatus,
        lastAction:
          input.contactedParty === 'agent' ? 'AgentContacted' : 'CustomerContacted',
        ownerUserId: current.ownerUserId,
        departmentId: current.departmentId,
        closedAt: null,
        logAction:
          input.contactedParty === 'agent' ? 'AgentContacted' : 'CustomerContacted',
        logNote: input.note,
        actionLabelKey: 'scf_action_contact',
      };
    case 'infoRequest': {
      const party = input.contactedParty ?? 'customer';
      return {
        caseStatus: waitingStatusForParty(party),
        lastAction: 'InformationRequested',
        ownerUserId: current.ownerUserId,
        departmentId: current.departmentId,
        closedAt: null,
        logAction: 'InformationRequested',
        logNote: input.note,
        actionLabelKey: 'scf_action_info_request',
      };
    }
    case 'resolve': {
      const status = (input.resolutionCode ?? 'Resolved_IssueFixed') as CaseStatus;
      return {
        caseStatus: status,
        lastAction: 'CaseClosed',
        ownerUserId: current.ownerUserId,
        departmentId: current.departmentId,
        closedAt: now,
        logAction: 'FinalResolutionProvided',
        logNote: input.note,
        actionLabelKey: 'scf_action_resolve',
      };
    }
    case 'reject':
      return {
        caseStatus: 'Rejected',
        lastAction: 'Rejected',
        ownerUserId: current.ownerUserId,
        departmentId: current.departmentId,
        closedAt: now,
        logAction: 'Rejected',
        logNote: input.note,
        actionLabelKey: 'scf_action_reject',
      };
    case 'reopen':
      return {
        caseStatus: 'ReOpened',
        lastAction: 'CaseReopened',
        ownerUserId: current.ownerUserId,
        departmentId: current.departmentId,
        closedAt: null,
        logAction: 'CaseReopened',
        logNote: input.reopenReason ?? input.note,
        actionLabelKey: 'scf_action_reopen',
      };
    default:
      return {
        caseStatus: current.caseStatus,
        lastAction: 'Assignment',
        ownerUserId: current.ownerUserId,
        departmentId: current.departmentId,
        closedAt: null,
        logAction: 'Assignment',
        logNote: input.note,
        actionLabelKey: 'scf_action_take',
      };
  }
}

export const RESOLUTION_OPTIONS: CaseStatus[] = [
  'Resolved_IssueFixed',
  'Resolved_NoIssue',
  'Resolved_STRFiled',
];

export const LEVEL_OPTIONS: Level[] = ['Low', 'Medium', 'High', 'Critical'];
