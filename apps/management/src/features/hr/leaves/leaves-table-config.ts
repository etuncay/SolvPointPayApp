import type {
  BackOfficeRole,
  TableApiResponse,
  TableConfig,
  TableQueryParams,
  TranslateFn,
} from '@epay/ui';
import { DEPARTMENTS } from '@/mocks/departments';
import type {
  EmployeeLeaveListRow,
  LeaveFilters,
  LeaveListScope,
  LeaveType,
  TaskStatus,
} from './domain/types';
import { countLeaveRows, createEmployeeLeavesService } from './api/mock-employee-leaves-adapter';
import tableConfigJson from './config/leaves.table.config.json';

type TableConfigJson = Omit<TableConfig, 'api'>;

function str(value: unknown): string {
  return value == null ? '' : String(value);
}

function toFilters(params: TableQueryParams): LeaveFilters {
  const tab = params.tabFilters ?? {};
  const header = params.headerFilters ?? {};
  return {
    query: str(header.search),
    leaveType: (str(header.leaveType) || 'any') as LeaveType | 'any',
    taskStatus: (str(tab.status) || 'any') as TaskStatus | 'any',
    departmentId: str(header.departmentId),
    dateFrom: str(header.dateFrom),
    dateTo: str(header.dateTo),
  };
}

function sortRows(
  rows: EmployeeLeaveListRow[],
  sortField: string | undefined,
  sortOrder: 'asc' | 'desc' | undefined,
): EmployeeLeaveListRow[] {
  if (!sortField) return rows;
  const dir = sortOrder === 'desc' ? -1 : 1;
  return [...rows].sort((a, b) => {
    const av = a[sortField as keyof EmployeeLeaveListRow];
    const bv = b[sortField as keyof EmployeeLeaveListRow];
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
    return str(av).localeCompare(str(bv), 'tr') * dir;
  });
}

export function buildLeavesTableConfig(
  scope: LeaveListScope,
  role: BackOfficeRole,
  showDepartmentFilter: boolean,
  t?: TranslateFn,
): TableConfig {
  const base = tableConfigJson as TableConfigJson;
  const service = createEmployeeLeavesService(role);

  const departmentOptions = [
    { label: t?.('lv_filter_dept_any', 'Tüm departmanlar') ?? 'Tüm departmanlar', value: '' },
    ...DEPARTMENTS.map((d) => ({ label: d.name, value: d.id })),
  ];

  const advancedFilters = (base.advancedFilters ?? [])
    .map((f) =>
      f.key === 'departmentId'
        ? { ...f, options: departmentOptions }
        : f,
    )
    .filter((f) => (f.key === 'departmentId' ? showDepartmentFilter : true));

  const localized: TableConfigJson = {
    ...base,
    title: t?.('s_hr_leave', base.title as string) ?? (base.title as string),
    search: {
      ...base.search,
      placeholder: t?.('lv_search_ph', base.search?.placeholder as string) ?? (base.search?.placeholder as string),
    },
    advancedFilters,
  };

  return {
    ...localized,
    api: {
      method: (params: TableQueryParams): Promise<TableApiResponse> => {
        const filters = toFilters(params);
        const filtered = service.list(scope, filters);
        const sorted = sortRows(filtered, params.sortField, params.sortOrder);
        const start = (params.page - 1) * params.pageSize;
        const pageRows = sorted.slice(start, start + params.pageSize);

        const allRows = service.list(scope, {
          query: '',
          leaveType: 'any',
          taskStatus: 'any',
          departmentId: '',
          dateFrom: '',
          dateTo: '',
        });

        const totalCount = countLeaveRows(scope, {
          query: '',
          leaveType: 'any',
          taskStatus: 'any',
          departmentId: '',
          dateFrom: '',
          dateTo: '',
        });

        return Promise.resolve({
          success: true,
          data: pageRows as unknown as Record<string, unknown>[],
          total: sorted.length,
          meta: {
            allCount: totalCount,
            pendingCount: allRows.filter((x) => x.taskStatus === 'Pending').length,
            approvedCount: allRows.filter((x) => x.taskStatus === 'Approved').length,
            rejectedCount: allRows.filter((x) => x.taskStatus === 'Rejected').length,
            canceledCount: allRows.filter((x) => x.taskStatus === 'Canceled').length,
          },
        });
      },
    },
  };
}
