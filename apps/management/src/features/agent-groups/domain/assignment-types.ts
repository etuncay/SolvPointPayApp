export type AssignmentStatus = 'Active' | 'Passive';

export type AgentGroupAssignment = {
  id: number;
  agentId: number;
  groupCode: string;
  assignedAt: string;
  status: AssignmentStatus;
  createdAt: string;
  createdBy: string;
  recordStatus: number;
};

export type AssignmentFilters = {
  query: string;
  status: 'Active' | 'Passive' | 'any';
};

export const DEFAULT_ASSIGNMENT_FILTERS: AssignmentFilters = {
  query: '',
  status: 'Active',
};

export type AssignmentListRow = {
  id: number;
  agentId: number;
  agentCode: string;
  agentName: string;
  city: string;
  district: string;
  avgFeePerTx: number | null;
  avgTxCount: number | null;
  currentGroupName: string;
  currentGroupCode: string;
  assignedAt: string;
  status: AssignmentStatus;
  groupCode: string;
};

export type AgentOption = {
  id: number;
  code: string;
  name: string;
  city: string;
  activeGroupCode: string | null;
};

export type AssignmentPermissions = {
  list: boolean;
  insert: boolean;
  remove: boolean;
  export: boolean;
};

export type AssignAgentResult = {
  ok: boolean;
  id?: number;
  error?: string;
  noOp?: boolean;
};

export type RemoveAssignmentResult = {
  ok: boolean;
  error?: string;
};
