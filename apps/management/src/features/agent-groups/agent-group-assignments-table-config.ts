import type { TableApiResponse, TableConfig, TableQueryParams, TranslateFn } from '@epay/ui';
import { agentGroupsService } from './api';
import type { AssignmentFilters, AssignmentListRow } from './domain/assignment-types';
import { DEFAULT_ASSIGNMENT_FILTERS } from './domain/assignment-types';
import tableConfigJson from './config/agent-group-assignments.table.config.json';

type TableConfigJson = Omit<TableConfig, 'api'>;

function str(value: unknown): string {
  return value == null ? '' : String(value);
}

function toFilters(params: TableQueryParams): AssignmentFilters {
  const header = params.headerFilters ?? {};
  const status = str(header.status) || DEFAULT_ASSIGNMENT_FILTERS.status;
  return {
    query: str(header.search),
    status: status as AssignmentFilters['status'],
  };
}

function sortRows(
  rows: AssignmentListRow[],
  sortField: string | undefined,
  sortOrder: 'asc' | 'desc' | undefined,
): AssignmentListRow[] {
  if (!sortField) return rows;
  const dir = sortOrder === 'desc' ? -1 : 1;
  return [...rows].sort((a, b) => {
    const av = a[sortField as keyof AssignmentListRow];
    const bv = b[sortField as keyof AssignmentListRow];
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
    return str(av).localeCompare(str(bv), 'tr') * dir;
  });
}

export function buildAgentGroupAssignmentsTableConfig(
  groupCode: string,
  t?: TranslateFn,
  onQuery?: (filters: AssignmentFilters) => void,
): TableConfig {
  const base = tableConfigJson as TableConfigJson;

  const localized: TableConfigJson = {
    ...base,
    search: {
      ...base.search,
      placeholder:
        t?.('aga_search_ph', base.search?.placeholder as string) ??
        (base.search?.placeholder as string),
    },
    toolbar: {
      ...base.toolbar,
      new: {
        ...(base.toolbar?.new ?? {}),
        label: t?.('aga_new_assign', base.toolbar?.new?.label as string) ?? (base.toolbar?.new?.label as string),
      },
    },
  };

  return {
    ...localized,
    api: {
      method: (params: TableQueryParams): Promise<TableApiResponse> => {
        const filters = toFilters(params);
        onQuery?.(filters);
        const filtered = agentGroupsService.listGroupAssignments(groupCode, filters);
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
