import type { TableApiResponse, TableConfig, TableQueryParams, TranslateFn } from '@epay/ui';
import { customerNotesService } from './api';
import type { CustomerNote, NoteFilters } from './domain/types';
import { localizeCustomerNotesTableConfig } from './localize-config';
import tableConfigJson from './config/customer-notes.table.config.json';

type TableConfigJson = Omit<TableConfig, 'api'>;

const SORT_FIELD: Record<string, keyof CustomerNote> = {
  customerNo: 'customerNo',
  target: 'targetEntityType',
  priority: 'priorityLevel',
  displayLimit: 'displayLimit',
  displayCount: 'displayCount',
  endDate: 'endDate',
};

function str(value: unknown): string {
  return value == null ? '' : String(value);
}

/** headerFilters → NoteFilters (mock servis sözleşmesi). */
function toFilters(params: TableQueryParams): NoteFilters {
  const header = params.headerFilters ?? {};
  return {
    query: str(header.search),
    targetEntityType: str(header.target) || 'any',
    priorityLevel: str(header.priority) || 'any',
  };
}

function sortRows(
  rows: CustomerNote[],
  sortField: string | undefined,
  sortOrder: 'asc' | 'desc' | undefined,
): CustomerNote[] {
  const field = sortField ? SORT_FIELD[sortField] : undefined;
  if (!field) return rows;
  const dir = sortOrder === 'desc' ? -1 : 1;
  return [...rows].sort((a, b) => {
    const av = a[field];
    const bv = b[field];
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
    return str(av).localeCompare(str(bv), 'tr') * dir;
  });
}

/** JSON tablo config + mock servis binder (client-side sıralama/sayfalama). */
export function buildCustomerNotesTableConfig(t?: TranslateFn): TableConfig {
  const base = tableConfigJson as TableConfigJson;
  const localized = t ? localizeCustomerNotesTableConfig(base, t) : base;

  return {
    ...localized,
    api: {
      method: (params: TableQueryParams): Promise<TableApiResponse> => {
        const rows = customerNotesService.list(toFilters(params));
        const sorted = sortRows(rows, params.sortField, params.sortOrder);
        const start = (params.page - 1) * params.pageSize;
        const pageRows = sorted.slice(start, start + params.pageSize);

        return Promise.resolve({
          data: pageRows as unknown as Record<string, unknown>[],
          total: sorted.length,
          success: true,
        });
      },
    },
  };
}
