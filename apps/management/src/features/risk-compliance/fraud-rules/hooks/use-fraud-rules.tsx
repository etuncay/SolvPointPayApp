import { useCallback, useMemo, useState } from 'react';
import { useRole } from '@/domain/role-context';
import { fraudRulesService } from '../api';
import { getFraudRulesPermissions } from '../domain/permissions';
import { EMPTY_FRAUD_RULE_FILTERS, type FraudRuleFilters } from '../domain/types';

export function useFraudRules() {
  const { role } = useRole();
  const permissions = getFraudRulesPermissions(role);
  const [filters, setFilters] = useState<FraudRuleFilters>(EMPTY_FRAUD_RULE_FILTERS);
  const [refreshKey, setRefreshKey] = useState(0);

  const rows = useMemo(() => {
    void refreshKey;
    return fraudRulesService.list(filters, role);
  }, [filters, role, refreshKey]);

  const updateFilters = (patch: Partial<FraudRuleFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const resetFilters = () => setFilters(EMPTY_FRAUD_RULE_FILTERS);

  const exportRows = useCallback(
    () => fraudRulesService.exportRows(filters, role),
    [filters, role],
  );

  const refresh = () => setRefreshKey((k) => k + 1);

  return {
    filters,
    updateFilters,
    resetFilters,
    rows,
    permissions,
    exportRows,
    refresh,
  };
}
