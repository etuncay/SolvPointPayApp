import type { AgentFilters, AgentListItem, AgentListResult } from '../domain/types';

export type AgentsService = {
  list(filters: AgentFilters): AgentListResult;
  exportRows(filters: AgentFilters): AgentListItem[];
  getById(id: number): AgentListItem | null;
};
