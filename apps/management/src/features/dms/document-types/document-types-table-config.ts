import type { TableApiResponse, TableConfig, TableQueryParams, TranslateFn } from '@epay/ui';
import type { BackOfficeRole } from '@epay/ui';
import { documentTypesService } from './api/mock-document-types-adapter';
import type { DocumentTypeListRow, DocumentTypesFilters } from './domain/types';
import tableConfigJson from './config/document-types.table.config.json';

type TableConfigJson = Omit<TableConfig, 'api'>;

function str(value: unknown): string {
  return value == null ? '' : String(value);
}

function toFilters(params: TableQueryParams): DocumentTypesFilters {
  const header = params.headerFilters ?? {};
  return {
    query: str(header.search),
    category: str(header.category) || 'any',
  };
}

function sortRows(
  rows: DocumentTypeListRow[],
  sortField: string | undefined,
  sortOrder: 'asc' | 'desc' | undefined,
): DocumentTypeListRow[] {
  if (!sortField) return rows;
  const dir = sortOrder === 'desc' ? -1 : 1;
  return [...rows].sort(
    (a, b) =>
      String(a[sortField as keyof DocumentTypeListRow] ?? '').localeCompare(
        String(b[sortField as keyof DocumentTypeListRow] ?? ''),
        'tr',
      ) * dir,
  );
}

export function buildDocumentTypesTableConfig(role: BackOfficeRole, t?: TranslateFn): TableConfig {
  const base = tableConfigJson as TableConfigJson;
  return {
    ...base,
    title: t?.('s_dms_types', base.title as string) ?? (base.title as string),
    search: {
      ...base.search,
      placeholder:
        t?.('dt_search_ph', base.search?.placeholder as string) ??
        (base.search?.placeholder as string),
    },
    api: {
      method: (params: TableQueryParams): Promise<TableApiResponse> => {
        const filters = toFilters(params);
        const filtered = documentTypesService.list(filters, role);
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
