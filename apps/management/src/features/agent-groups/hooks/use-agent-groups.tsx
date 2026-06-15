import { useCallback, useMemo, useState } from 'react';
import { agentGroupsService } from '../api';
import {
  DEFAULT_AGENT_GROUP_FILTERS,
  type AgentGroupFilters,
  type AgentGroupInput,
  type AgentGroupUpdateInput,
} from '../domain/types';

export function useAgentGroups() {
  const [filters, setFilters] = useState<AgentGroupFilters>(DEFAULT_AGENT_GROUP_FILTERS);
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  const rows = useMemo(
    () => agentGroupsService.list(filters),
    [filters, version],
  );

  const updateFilters = useCallback((patch: Partial<AgentGroupFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const create = useCallback(
    (input: AgentGroupInput) => {
      const result = agentGroupsService.create(input);
      if (result.ok) refresh();
      return result;
    },
    [refresh],
  );

  const update = useCallback(
    (id: number, input: AgentGroupUpdateInput) => {
      const result = agentGroupsService.update(id, input);
      if (result.ok) refresh();
      return result;
    },
    [refresh],
  );

  const deactivate = useCallback(
    (id: number) => {
      const result = agentGroupsService.deactivate(id);
      if (result.ok) refresh();
      return result;
    },
    [refresh],
  );

  return { filters, updateFilters, rows, create, update, deactivate, refresh, version };
}
