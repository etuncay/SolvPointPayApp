import { useCallback, useMemo, useState } from 'react';
import { agentGroupsService } from '../api';
import {
  DEFAULT_ASSIGNMENT_FILTERS,
  type AssignmentFilters,
} from '../domain/assignment-types';

export function useAgentGroupAssignments(groupCode: string) {
  const [filters, setFilters] = useState<AssignmentFilters>(DEFAULT_ASSIGNMENT_FILTERS);
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  const group = useMemo(
    () => agentGroupsService.getByCode(groupCode),
    [groupCode, version],
  );

  const rows = useMemo(
    () => agentGroupsService.listGroupAssignments(groupCode, filters),
    [groupCode, filters, version],
  );

  const agentOptions = useMemo(
    () => agentGroupsService.listAgentOptions(),
    [version],
  );

  const updateFilters = useCallback((patch: Partial<AssignmentFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const assign = useCallback(
    (agentId: number) => {
      const result = agentGroupsService.assignAgentToGroup(groupCode, agentId);
      if (result.ok) refresh();
      return result;
    },
    [groupCode, refresh],
  );

  const remove = useCallback(
    (assignmentId: number) => {
      const result = agentGroupsService.removeAgentFromGroup(assignmentId);
      if (result.ok) refresh();
      return result;
    },
    [refresh],
  );

  return {
    group,
    filters,
    updateFilters,
    rows,
    agentOptions,
    assign,
    remove,
    refresh,
    version,
  };
}
