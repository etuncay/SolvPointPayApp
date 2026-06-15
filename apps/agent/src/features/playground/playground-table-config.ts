import type { TableConfig, TableQueryParams, TranslateFn } from '@epay/ui';
import { fetchCustomersList } from '@epay/data';
import tableConfigJson from './config/table.config.json';
import { localizePlaygroundTableConfig } from './localize-config';

type TableConfigJson = Omit<TableConfig, 'api'>;

/** JSON tablo config + @epay/data list API (server-side sayfalama) */
export function buildPlaygroundTableConfig(t?: TranslateFn): TableConfig {
  const base = tableConfigJson as TableConfigJson;
  const localized = t ? localizePlaygroundTableConfig(base, t) : base;
  return {
    ...localized,
    api: {
      method: (params: TableQueryParams) =>
        fetchCustomersList({
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
