import type { TableApiResponse, TableConfig, TableQueryParams, TranslateFn } from '@epay/ui';
import type { BackOfficeRole } from '@epay/ui';
import { rolesService } from './api/mock-roles-adapter';
import type { RoleListRow } from './domain/types';
import tableConfigJson from './config/roles.table.config.json';

type TableConfigJson = Omit<TableConfig, 'api'>;

function str(value: unknown): string {
  return value == null ? '' : String(value);
}

function toStatus(params: TableQueryParams): 'any' | 'Active' | 'Passive' {
  const tab = params.tabFilters ?? {};
  return (str(tab.status) || 'any') as 'any' | 'Active' | 'Passive';
}

function toQuery(params: TableQueryParams): string {
  const header = params.headerFilters ?? {};
  return str(header.search).trim().toLowerCase();
}

function sortRows(
  rows: RoleListRow[],
  sortField: string | undefined,
  sortOrder: 'asc' | 'desc' | undefined,
): RoleListRow[] {
  if (!sortField) return rows;
  const dir = sortOrder === 'desc' ? -1 : 1;
  return [...rows].sort((a, b) => {
    const av = a[sortField as keyof RoleListRow];
    const bv = b[sortField as keyof RoleListRow];
    return String(av ?? '').localeCompare(String(bv ?? ''), 'tr') * dir;
  });
}

export function buildRolesTableConfig(
  role: BackOfficeRole,
  t?: TranslateFn,
): TableConfig {
  const base = tableConfigJson as TableConfigJson;

  const localized: TableConfigJson = {
    ...base,
    title: t?.('s_sys_roles', base.title as string) ?? (base.title as string),
    search: {
      ...base.search,
      placeholder: t?.('rol_search_ph', base.search?.placeholder as string) ?? (base.search?.placeholder as string),
    },
    toolbar: {
      ...base.toolbar,
      new: {
        ...(base.toolbar?.new ?? {}),
        label: t?.('rol_new', base.toolbar?.new?.label as string) ?? (base.toolbar?.new?.label as string),
      },
    },
  };

  return {
    ...localized,
    api: {
      method: (params: TableQueryParams): Promise<TableApiResponse> => {
        const status = toStatus(params);
        const query = toQuery(params);

        let filtered = rolesService.list(role);
        if (status !== 'any') filtered = filtered.filter((r) => r.status === status);
        if (query) {
          filtered = filtered.filter(
            (r) =>
              r.name.toLowerCase().includes(query) ||
              r.description.toLowerCase().includes(query),
          );
        }
        const sorted = sortRows(filtered, params.sortField, params.sortOrder);
        const start = (params.page - 1) * params.pageSize;
        const pageRows = sorted.slice(start, start + params.pageSize);

        const allRows = rolesService.list(role);
        return Promise.resolve({
          success: true,
          data: pageRows as unknown as Record<string, unknown>[],
          total: sorted.length,
          meta: {
            allCount: allRows.length,
            activeCount: allRows.filter((x) => x.status === 'Active').length,
            passiveCount: allRows.filter((x) => x.status === 'Passive').length,
          },
        });
      },
    },
  };
}
