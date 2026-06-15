import { useCallback, useMemo, useState } from 'react';
import { agentFeesService } from '../api';
import {
  DEFAULT_AGENT_FEE_FILTERS,
  type AgentFeeFilters,
  type AgentFeeInput,
  type AgentFeeUpdateInput,
} from '../domain/types';

export function useAgentFees() {
  const [filters, setFilters] = useState<AgentFeeFilters>(DEFAULT_AGENT_FEE_FILTERS);
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  const rows = useMemo(
    () => agentFeesService.list(filters),
    [filters, version],
  );

  const updateFilters = useCallback((patch: Partial<AgentFeeFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const create = useCallback(
    (input: AgentFeeInput) => {
      const result = agentFeesService.create(input);
      if (result.ok) refresh();
      return result;
    },
    [refresh],
  );

  const update = useCallback(
    (id: number, input: AgentFeeUpdateInput) => {
      const result = agentFeesService.update(id, input);
      if (result.ok) refresh();
      return result;
    },
    [refresh],
  );

  const hasConflict = useCallback(
    (input: AgentFeeInput) => agentFeesService.hasActiveConflict(input),
    [],
  );

  return { filters, updateFilters, rows, create, update, hasConflict, refresh, version };
}
