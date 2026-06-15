import { useCallback, useMemo, useState } from 'react';
import { agentsService } from '../api';
import { DEFAULT_AGENT_FILTERS, type AgentFilters } from '../domain/types';

export function useAgents(initialFilters: AgentFilters = DEFAULT_AGENT_FILTERS) {
  const [filters, setFilters] = useState<AgentFilters>(initialFilters);
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  const result = useMemo(
    () => agentsService.list(filters),
    [filters, version],
  );

  const exportRows = useCallback(
    () => agentsService.exportRows(filters),
    [filters, version],
  );

  const updateFilters = useCallback((patch: Partial<AgentFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  return {
    filters,
    setFilters,
    updateFilters,
    rows: result.rows,
    total: result.total,
    counts: result.counts,
    stats: result.stats,
    exportRows,
    refresh,
  };
}
