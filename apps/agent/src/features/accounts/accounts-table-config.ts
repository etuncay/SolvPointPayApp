import type { TableConfig, TableQueryParams, TranslateFn } from '@epay/ui';
import { fetchAgentActivitiesList, fetchAgentBalances } from '@epay/data';
import activitiesJson from './config/activities.table.config.json';
import balancesJson from './config/balances.table.config.json';
import {
  localizeAccountsActivitiesConfig,
  localizeAccountsBalancesConfig,
} from './localize-config';

type TableConfigJson = Omit<TableConfig, 'api'>;

/** Hesap hareketleri — JSON config + @epay/data list API (server-side). */
export function buildAccountsActivitiesTableConfig(t?: TranslateFn): TableConfig {
  const base = activitiesJson as TableConfigJson;
  const localized = t ? localizeAccountsActivitiesConfig(base, t) : base;
  return {
    ...localized,
    api: {
      method: (params: TableQueryParams) =>
        fetchAgentActivitiesList({
          page: params.page,
          pageSize: params.pageSize,
          sortField: params.sortField,
          sortOrder: params.sortOrder,
          filters: params.filters,
          headerFilters: params.headerFilters,
          tabFilters: params.tabFilters,
        }),
    },
  };
}

/** Bakiye paneli — JSON config + @epay/data (tek sayfa, salt okunur). */
export function buildAccountsBalancesTableConfig(t?: TranslateFn): TableConfig {
  const base = balancesJson as TableConfigJson;
  const localized = t ? localizeAccountsBalancesConfig(base, t) : base;
  return {
    ...localized,
    api: {
      method: async () => {
        const rows = await fetchAgentBalances();
        return { data: rows as unknown as Record<string, unknown>[], total: rows.length, success: true };
      },
    },
  };
}
