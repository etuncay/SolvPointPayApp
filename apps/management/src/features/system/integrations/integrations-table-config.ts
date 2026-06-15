import type { TableApiResponse, TableConfig, TableQueryParams, TranslateFn } from '@epay/ui';
import type { BackOfficeRole } from '@epay/ui';
import { integrationsService } from './api/mock-integrations-adapter';
import type { IntegrationDefinition, IntegrationFilters } from './domain/types';
import tableConfigJson from './config/integrations.table.config.json';

type TableConfigJson = Omit<TableConfig, 'api'>;

function str(value: unknown): string {
  return value == null ? '' : String(value);
}

function toFilters(params: TableQueryParams): IntegrationFilters {
  const header = params.headerFilters ?? {};
  return {
    query: str(header.search),
    type: (str(header.type) || 'any') as IntegrationFilters['type'],
    status: (str(header.status) || 'any') as IntegrationFilters['status'],
  };
}

function sortRows(
  rows: IntegrationDefinition[],
  sortField: string | undefined,
  sortOrder: 'asc' | 'desc' | undefined,
): IntegrationDefinition[] {
  if (!sortField) return rows;
  const dir = sortOrder === 'desc' ? -1 : 1;
  return [...rows].sort((a, b) => String(a[sortField as keyof IntegrationDefinition] ?? '').localeCompare(String(b[sortField as keyof IntegrationDefinition] ?? ''), 'tr') * dir);
}

export function buildIntegrationsTableConfig(
  role: BackOfficeRole,
  t?: TranslateFn,
): TableConfig {
  const base = tableConfigJson as TableConfigJson;
  const localized: TableConfigJson = {
    ...base,
    title: t?.('s_sys_integrations', base.title as string) ?? (base.title as string),
    search: {
      ...base.search,
      placeholder: t?.('int_search_ph', base.search?.placeholder as string) ?? (base.search?.placeholder as string),
    },
    toolbar: {
      ...base.toolbar,
      new: {
        ...(base.toolbar?.new ?? {}),
        label: t?.('int_new', base.toolbar?.new?.label as string) ?? (base.toolbar?.new?.label as string),
      },
    },
  };

  return {
    ...localized,
    api: {
      method: (params: TableQueryParams): Promise<TableApiResponse> => {
        const filters = toFilters(params);
        const filtered = integrationsService.list(role, filters);
        const sorted = sortRows(filtered, params.sortField, params.sortOrder);
        const start = (params.page - 1) * params.pageSize;
        const pageRows = sorted.slice(start, start + params.pageSize);
        return Promise.resolve({
          success: true,
          data: pageRows as unknown as Record<string, unknown>[],
          total: sorted.length,
        });
      },
    },
  };
}
