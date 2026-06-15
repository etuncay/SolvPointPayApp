import type { TableApiResponse, TableConfig, TableQueryParams, TranslateFn } from '@epay/ui';
import { agentGroupsService } from '@/features/agent-groups/api';
import { agentsService } from './api';
import {
  EMPTY_ADV_FILTERS,
  type AgentAdvFilters,
  type AgentFilters,
  type AgentListItem,
  type EntityStatusFilter,
} from './domain/types';
import tableConfigJson from './config/agents.table.config.json';

type TableConfigJson = Omit<TableConfig, 'api'>;

function str(value: unknown): string {
  return value == null ? '' : String(value);
}

function toFilters(params: TableQueryParams): AgentFilters {
  const header = params.headerFilters ?? {};
  const tab = params.tabFilters ?? {};
  const status = (str(tab.status) || 'all') as EntityStatusFilter;
  const advanced: AgentAdvFilters = {
    ...EMPTY_ADV_FILTERS,
    group: str(header.group) || 'any',
    settlement: str(header.settlement) || 'any',
    balance: str(header.balance) || 'any',
    from: str(header.createdFrom),
    to: str(header.createdTo),
  };
  return { status, query: str(header.search), advanced };
}

function sortRows(
  rows: AgentListItem[],
  sortField: string | undefined,
  sortOrder: 'asc' | 'desc' | undefined,
): AgentListItem[] {
  if (!sortField) return rows;
  const dir = sortOrder === 'desc' ? -1 : 1;
  return [...rows].sort(
    (a, b) =>
      String(a[sortField as keyof AgentListItem] ?? '').localeCompare(
        String(b[sortField as keyof AgentListItem] ?? ''),
        'tr',
      ) * dir,
  );
}

export function buildAgentsTableConfig(
  t?: TranslateFn,
  onQuery?: (filters: AgentFilters) => void,
): TableConfig {
  const base = tableConfigJson as TableConfigJson;
  const groupOptions = agentGroupsService.listActiveLegacy();
  const advancedFilters = (base.advancedFilters ?? []).map((f) =>
    f.key === 'group'
      ? {
          ...f,
          options: [
            { label: t?.('ib_all', 'Tümü') ?? 'Tümü', value: 'any' },
            ...groupOptions.map((g) => ({ label: g.label, value: g.key })),
          ],
        }
      : f,
  );

  return {
    ...base,
    title: t?.('nav_agents', base.title as string) ?? (base.title as string),
    advancedFilters,
    api: {
      method: (params: TableQueryParams): Promise<TableApiResponse> => {
        const filters = toFilters(params);
        onQuery?.(filters);
        const { rows, counts } = agentsService.list(filters);
        const sorted = sortRows(rows, params.sortField, params.sortOrder);
        const start = (params.page - 1) * params.pageSize;
        const pageRows = sorted.slice(start, start + params.pageSize);
        return Promise.resolve({
          success: true,
          data: pageRows as unknown as Record<string, unknown>[],
          total: sorted.length,
          meta: {
            activeCount: counts.active,
            inactiveCount: counts.inactive,
            blockedCount: counts.blocked,
            closedCount: counts.closed,
            allCount: counts.all,
          },
        });
      },
    },
  };
}
