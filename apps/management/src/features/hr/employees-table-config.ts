import type { TableApiResponse, TableConfig, TableQueryParams, TranslateFn } from '@epay/ui';
import { employeesService } from './api/mock-employees-adapter';
import type { EmployeeFilters, EmployeeListRow, EmploymentStatus, HrListScope } from './domain/types';
import tableConfigJson from './config/employees.table.config.json';

type TableConfigJson = Omit<TableConfig, 'api'>;

function str(value: unknown): string {
  return value == null ? '' : String(value);
}

function toFilters(params: TableQueryParams): EmployeeFilters {
  const tab = params.tabFilters ?? {};
  const header = params.headerFilters ?? {};
  const status = (str(tab.status) || 'any') as EmploymentStatus | 'any';
  return {
    query: str(header.search),
    status,
    hireFrom: str(header.hireFrom),
    hireTo: str(header.hireTo),
  };
}

function sortRows(
  rows: EmployeeListRow[],
  sortField: string | undefined,
  sortOrder: 'asc' | 'desc' | undefined,
): EmployeeListRow[] {
  if (!sortField) return rows;
  const dir = sortOrder === 'desc' ? -1 : 1;
  return [...rows].sort((a, b) => {
    const av = a[sortField as keyof EmployeeListRow];
    const bv = b[sortField as keyof EmployeeListRow];
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
    return str(av).localeCompare(str(bv), 'tr') * dir;
  });
}

export function buildEmployeesTableConfig(
  scope: HrListScope,
  t?: TranslateFn,
): TableConfig {
  const base = tableConfigJson as TableConfigJson;

  const localized: TableConfigJson = t
    ? {
        ...base,
        title: t('s_hr_employees', base.title as string),
        search: {
          ...base.search,
          placeholder: t('hr_search_ph', base.search?.placeholder as string),
        },
        toolbar: {
          ...base.toolbar,
          new: {
            ...(base.toolbar?.new ?? {}),
            label: t('s_hr_new_employee', base.toolbar?.new?.label as string),
          },
        },
      }
    : base;

  return {
    ...localized,
    api: {
      method: (params: TableQueryParams): Promise<TableApiResponse> => {
        const allRows = employeesService.list(scope, {
          query: '',
          status: 'any',
          hireFrom: '',
          hireTo: '',
        });
        const filters = toFilters(params);
        const filtered = employeesService.list(scope, filters);
        const sorted = sortRows(filtered, params.sortField, params.sortOrder);
        const start = (params.page - 1) * params.pageSize;
        const pageRows = sorted.slice(start, start + params.pageSize);

        return Promise.resolve({
          success: true,
          data: pageRows as unknown as Record<string, unknown>[],
          total: sorted.length,
          meta: {
            allCount: allRows.length,
            activeCount: allRows.filter((x) => x.employmentStatus === 'Active').length,
            onLeaveCount: allRows.filter((x) => x.employmentStatus === 'OnLeave').length,
            terminatedCount: allRows.filter((x) => x.employmentStatus === 'Terminated').length,
          },
        });
      },
    },
  };
}
