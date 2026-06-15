import type { TableApiResponse, TableConfig, TableQueryParams, TranslateFn } from '@epay/ui';
import type { BackOfficeRole } from '@epay/ui';
import { scheduledJobsService } from './api/mock-scheduled-jobs-adapter';
import type { JobFilters, ScheduledJobListRow } from './domain/types';
import tableConfigJson from './config/scheduled-jobs.table.config.json';

type TableConfigJson = Omit<TableConfig, 'api'>;

function str(value: unknown): string {
  return value == null ? '' : String(value);
}

function toFilters(params: TableQueryParams): JobFilters {
  const header = params.headerFilters ?? {};
  return {
    query: str(header.search),
    status: (str(header.status) || 'any') as JobFilters['status'],
    jobType: (str(header.jobType) || 'any') as JobFilters['jobType'],
  };
}

function sortRows(
  rows: ScheduledJobListRow[],
  sortField: string | undefined,
  sortOrder: 'asc' | 'desc' | undefined,
): ScheduledJobListRow[] {
  if (!sortField) return rows;
  const dir = sortOrder === 'desc' ? -1 : 1;
  return [...rows].sort((a, b) => String(a[sortField as keyof ScheduledJobListRow] ?? '').localeCompare(String(b[sortField as keyof ScheduledJobListRow] ?? ''), 'tr') * dir);
}

export function buildScheduledJobsTableConfig(role: BackOfficeRole, t?: TranslateFn): TableConfig {
  const base = tableConfigJson as TableConfigJson;
  const localized: TableConfigJson = {
    ...base,
    title: t?.('s_sys_scheduled', base.title as string) ?? (base.title as string),
    search: {
      ...base.search,
      placeholder: t?.('sj_search_ph', base.search?.placeholder as string) ?? (base.search?.placeholder as string),
    },
    toolbar: {
      ...base.toolbar,
      new: {
        ...(base.toolbar?.new ?? {}),
        label: t?.('sj_new_job', base.toolbar?.new?.label as string) ?? (base.toolbar?.new?.label as string),
      },
    },
  };

  return {
    ...localized,
    api: {
      method: (params: TableQueryParams): Promise<TableApiResponse> => {
        const filters = toFilters(params);
        const filtered = scheduledJobsService.list(role, filters);
        const sorted = sortRows(filtered, params.sortField, params.sortOrder);
        const start = (params.page - 1) * params.pageSize;
        const pageRows = sorted.slice(start, start + params.pageSize);
        return Promise.resolve({
          success: true,
          data: pageRows as unknown as Record<string, unknown>[],
          total: sorted.length,
          meta: {
            counts: {
              any: filtered.length,
              Active: filtered.filter((row) => row.status === 'Active').length,
              Passive: filtered.filter((row) => row.status === 'Passive').length,
            },
          },
        });
      },
    },
  };
}
