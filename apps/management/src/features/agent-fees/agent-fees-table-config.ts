import type { TableApiResponse, TableConfig, TableQueryParams, TranslateFn } from '@epay/ui';
import { agentGroupsService } from '@/features/agent-groups/api';
import { agentFeesService } from './api';
import { sortAgentFees } from './domain/sort-agent-fees';
import {
  DEFAULT_AGENT_FEE_FILTERS,
  type AgentFee,
  type AgentFeeFilters,
} from './domain/types';
import tableConfigJson from './config/agent-fees.table.config.json';

type TableConfigJson = Omit<TableConfig, 'api'>;

function str(value: unknown): string {
  return value == null ? '' : String(value);
}

function toFilters(params: TableQueryParams): AgentFeeFilters {
  const header = params.headerFilters ?? {};
  return {
    query: str(header.search),
    groupCode: str(header.groupCode) || 'any',
    transactionType: str(header.transactionType) || 'any',
    currency: str(header.currency) || 'any',
    status: str(header.status) || DEFAULT_AGENT_FEE_FILTERS.status,
  };
}

function sortRows(
  rows: AgentFee[],
  sortField: string | undefined,
  sortOrder: 'asc' | 'desc' | undefined,
): AgentFee[] {
  if (!sortField) return sortAgentFees(rows);
  const dir = sortOrder === 'desc' ? -1 : 1;
  return [...rows].sort((a, b) => {
    const av = a[sortField as keyof AgentFee];
    const bv = b[sortField as keyof AgentFee];
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
    return str(av).localeCompare(str(bv), 'tr') * dir;
  });
}

export function buildAgentFeesTableConfig(
  t?: TranslateFn,
  onQuery?: (filters: AgentFeeFilters) => void,
): TableConfig {
  const base = tableConfigJson as TableConfigJson;
  const groups = agentGroupsService.list({ query: '', status: 'any' });

  const localized: TableConfigJson = {
    ...base,
    title: t?.('s_cust_fees', base.title as string) ?? (base.title as string),
    search: {
      ...base.search,
      placeholder:
        t?.('afee_search_ph', base.search?.placeholder as string) ??
        (base.search?.placeholder as string),
    },
    toolbar: {
      ...base.toolbar,
      new: {
        ...(base.toolbar?.new ?? {}),
        label: t?.('afee_new', base.toolbar?.new?.label as string) ?? (base.toolbar?.new?.label as string),
      },
    },
    advancedFilters: (base.advancedFilters ?? []).map((filter) => {
      if (filter.key === 'groupCode') {
        return {
          ...filter,
          label: t?.('prm_filter_group_any', filter.label as string) ?? filter.label,
          options: [
            { label: t?.('prm_filter_group_any', 'Tümü') ?? 'Tümü', value: 'any' },
            ...groups.map((g) => ({ label: g.groupCode, value: g.groupCode })),
          ],
        };
      }
      if (filter.key === 'transactionType') {
        return {
          ...filter,
          label: t?.('rs_scope_transaction', filter.label as string) ?? filter.label,
          options: [
            { label: t?.('cfe_all_tx', 'Tümü') ?? 'Tümü', value: 'any' },
            ...(filter.options ?? []).filter((o) => o.value !== 'any'),
          ],
        };
      }
      if (filter.key === 'currency') {
        return {
          ...filter,
          label: t?.('cba_col_currency', filter.label as string) ?? filter.label,
          options: [
            { label: t?.('cba_all_currencies', 'Tümü') ?? 'Tümü', value: 'any' },
            ...(filter.options ?? []).filter((o) => o.value !== 'any'),
          ],
        };
      }
      if (filter.key === 'status') {
        return {
          ...filter,
          label: t?.('scf_col_status', filter.label as string) ?? filter.label,
          options: (filter.options ?? []).map((o) => ({
            ...o,
            label: t?.(`afee_status_${o.value}`, o.label as string) ?? o.label,
          })),
        };
      }
      return filter;
    }),
  };

  return {
    ...localized,
    api: {
      method: (params: TableQueryParams): Promise<TableApiResponse> => {
        const filters = toFilters(params);
        onQuery?.(filters);
        const filtered = agentFeesService.list(filters);
        const sorted = sortRows(filtered, params.sortField, params.sortOrder);
        const start = (params.page - 1) * params.pageSize;
        const pageRows = sorted.slice(start, start + params.pageSize);
        const activeCount = agentFeesService.list({
          ...DEFAULT_AGENT_FEE_FILTERS,
          status: 'Active',
        }).length;

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
