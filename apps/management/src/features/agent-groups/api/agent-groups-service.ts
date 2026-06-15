import type {
  AgentGroupFilters,
  AgentGroupInput,
  AgentGroupListRow,
  AgentGroupUpdateInput,
  LegacyAgentGroupOption,
  SaveAgentGroupResult,
} from '../domain/types';
import type {
  AgentOption,
  AssignAgentResult,
  AssignmentFilters,
  AssignmentListRow,
  RemoveAssignmentResult,
} from '../domain/assignment-types';

export type AgentGroupChangeLogEntry = {
  id: number;
  action: 'create' | 'update' | 'deactivate' | 'metrics_batch' | 'assign' | 'remove';
  entityId: number;
  previous: unknown;
  next: unknown;
  at: string;
  by: string;
};

export type AgentGroupsService = {
  list(filters?: AgentGroupFilters): AgentGroupListRow[];
  create(input: AgentGroupInput): SaveAgentGroupResult;
  update(id: number, input: AgentGroupUpdateInput): SaveAgentGroupResult;
  deactivate(id: number): SaveAgentGroupResult;
  listActiveLegacy(): LegacyAgentGroupOption[];
  countActiveAgents(groupCode: string): number;
  getDefaultGroup(): LegacyAgentGroupOption;
  getByCode(groupCode: string): AgentGroupListRow | null;
  runDailyMetricsBatch(): number;
  listGroupAssignments(groupCode: string, filters?: AssignmentFilters): AssignmentListRow[];
  listAgentOptions(): AgentOption[];
  assignAgentToGroup(groupCode: string, agentId: number): AssignAgentResult;
  removeAgentFromGroup(assignmentId: number): RemoveAssignmentResult;
  syncAssignmentFromAgentGroup(agentId: number, groupKey: string): void;
};
