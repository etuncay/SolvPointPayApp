import type { TableApiResponse, TableConfig, TableQueryParams, TranslateFn } from '@epay/ui';
import { usersService } from './api/mock-users-adapter';
import type { UserActivityRow } from './domain/types';
import tableConfigJson from './config/user-activities.table.config.json';

type TableConfigJson = Omit<TableConfig, 'api'>;

function str(value: unknown): string {
  return value == null ? '' : String(value);
}

function sortRows(
  rows: UserActivityRow[],
  sortField: string | undefined,
  sortOrder: 'asc' | 'desc' | undefined,
): UserActivityRow[] {
  if (!sortField) return rows;
  const dir = sortOrder === 'desc' ? -1 : 1;
  return [...rows].sort(
    (a, b) =>
      String(a[sortField as keyof UserActivityRow] ?? '').localeCompare(
        String(b[sortField as keyof UserActivityRow] ?? ''),
        'tr',
      ) * dir,
  );
}

export function buildUserActivitiesTableConfig(
  userId: string,
  t?: TranslateFn,
): TableConfig {
  const base = tableConfigJson as TableConfigJson;
  const localized: TableConfigJson = {
    ...base,
    title: t?.('usr_activities_title', base.title as string) ?? (base.title as string),
  };

  return {
    ...localized,
    api: {
      method: (params: TableQueryParams): Promise<TableApiResponse> => {
        const header = params.headerFilters ?? {};
        const from = str(header.from);
        const to = str(header.to);
        const filtered = usersService.getActivityLog(userId).filter((row) => {
          const day = row.at.slice(0, 10);
          if (from && day < from) return false;
          if (to && day > to) return false;
          return true;
        });
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
