import type { TableApiResponse, TableConfig, TableQueryParams, TranslateFn } from '@epay/ui';
import type { BackOfficeRole } from '@epay/ui';
import { getRolesStore } from '@/mocks/roles-store';
import { usersService } from './api/mock-users-adapter';
import type { AppUserFilters, AppUserListRow } from './domain/types';
import tableConfigJson from './config/users.table.config.json';

type TableConfigJson = Omit<TableConfig, 'api'>;

function str(value: unknown): string {
  return value == null ? '' : String(value);
}

function toFilters(params: TableQueryParams): AppUserFilters {
  const tab = params.tabFilters ?? {};
  const header = params.headerFilters ?? {};
  return {
    query: str(header.search),
    roleId: str(header.roleId) || 'any',
    status: (str(tab.status) || 'any') as AppUserFilters['status'],
  };
}

function sortRows(
  rows: AppUserListRow[],
  sortField: string | undefined,
  sortOrder: 'asc' | 'desc' | undefined,
): AppUserListRow[] {
  if (!sortField) return rows;
  const dir = sortOrder === 'desc' ? -1 : 1;
  return [...rows].sort((a, b) => {
    const av = a[sortField as keyof AppUserListRow];
    const bv = b[sortField as keyof AppUserListRow];
    return String(av ?? '').localeCompare(String(bv ?? ''), 'tr') * dir;
  });
}

export function buildUsersTableConfig(
  role: BackOfficeRole,
  t?: TranslateFn,
): TableConfig {
  const base = tableConfigJson as TableConfigJson;
  const roleOptions = getRolesStore().map((r) => ({
    label: `${r.name}${r.status === 'Passive' ? ` (${t?.('rol_status_Passive', 'Passive') ?? 'Passive'})` : ''}`,
    value: r.id,
  }));

  const localized: TableConfigJson = {
    ...base,
    title: t?.('s_sys_users', base.title as string) ?? (base.title as string),
    search: {
      ...base.search,
      placeholder: t?.('usr_search_ph', base.search?.placeholder as string) ?? (base.search?.placeholder as string),
    },
    advancedFilters: (base.advancedFilters ?? []).map((f) =>
      f.key === 'roleId'
        ? { ...f, options: [...(f.options ?? []), ...roleOptions] }
        : f,
    ),
  };

  return {
    ...localized,
    api: {
      method: (params: TableQueryParams): Promise<TableApiResponse> => {
        const filters = toFilters(params);
        const filtered = usersService.list(role, filters);
        const sorted = sortRows(filtered, params.sortField, params.sortOrder);
        const start = (params.page - 1) * params.pageSize;
        const pageRows = sorted.slice(start, start + params.pageSize);

        const allRows = usersService.list(role, { query: '', roleId: 'any', status: 'any' });
        return Promise.resolve({
          success: true,
          data: pageRows as unknown as Record<string, unknown>[],
          total: sorted.length,
          meta: {
            allCount: allRows.length,
            activeCount: allRows.filter((x) => x.status === 'Active').length,
            inactiveCount: allRows.filter((x) => x.status === 'Inactive').length,
          },
        });
      },
    },
  };
}
