import type { TableApiResponse, TableConfig, TableQueryParams, TranslateFn } from '@epay/ui';
import { agentGroupsService } from './api';
import type { AgentGroupFilters, AgentGroupListRow } from './domain/types';
import { DEFAULT_AGENT_GROUP_FILTERS } from './domain/types';
import tableConfigJson from './config/agent-groups.table.config.json';

type TableConfigJson = Omit<TableConfig, 'api'>;

function str(value: unknown): string {
  return value == null ? '' : String(value);
}

function toFilters(params: TableQueryParams): AgentGroupFilters {
  const header = params.headerFilters ?? {};
  return {
    query: str(header.search),
    status: str(header.status) || DEFAULT_AGENT_GROUP_FILTERS.status,
  };
}

function sortRows(
  rows: AgentGroupListRow[],
  sortField: string | undefined,
  sortOrder: 'asc' | 'desc' | undefined,
): AgentGroupListRow[] {
  if (!sortField) return rows;
  const dir = sortOrder === 'desc' ? -1 : 1;
  return [...rows].sort((a, b) => {
    const av = a[sortField as keyof AgentGroupListRow];
    const bv = b[sortField as keyof AgentGroupListRow];
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
    return str(av).localeCompare(str(bv), 'tr') * dir;
  });
}

export function buildAgentGroupsTableConfig(
  t?: TranslateFn,
  onQuery?: (filters: AgentGroupFilters) => void,
): TableConfig {
  const base = tableConfigJson as TableConfigJson;

  const localized: TableConfigJson = {
    ...base,
    title: t?.('s_ag_group', base.title as string) ?? (base.title as string),
    search: {
      ...base.search,
      placeholder:
        t?.('agg_search_ph', base.search?.placeholder as string) ??
        (base.search?.placeholder as string),
    },
    toolbar: {
      ...base.toolbar,
      new: {
        ...(base.toolbar?.new ?? {}),
        label: t?.('agg_new', base.toolbar?.new?.label as string) ?? (base.toolbar?.new?.label as string),
      },
    },
  };

  return {
    ...localized,
    api: {
      method: (params: TableQueryParams): Promise<TableApiResponse> => {
        const filters = toFilters(params);
        onQuery?.(filters);
        const filtered = agentGroupsService.list(filters);
        const sorted = sortRows(filtered, params.sortField, params.sortOrder);
        const start = (params.page - 1) * params.pageSize;
        const pageRows = sorted.slice(start, start + params.pageSize);
        const activeCount = agentGroupsService.list({ ...DEFAULT_AGENT_GROUP_FILTERS, status: 'Active' })
          .length;

        return Promise.resolve({
          success: true,
          data: pageRows as unknown as Record<string, unknown>[],
          total: sorted.length,
          meta: { activeCount },
        });
      },
    },
  };
}
