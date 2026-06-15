import type { TableApiResponse, TableConfig, TableQueryParams, TranslateFn } from '@epay/ui';
import type { BackOfficeRole } from '@epay/ui';
import { DOCUMENT_CATEGORIES, type DocumentCategory, type DocumentStatus } from '@/features/document-review/domain/types';
import { documentTypesService } from './document-types/api/mock-document-types-adapter';
import { documentsService } from './api/mock-documents-adapter';
import type { DocumentsListFilters, DmsDocumentListRow } from './domain/types';
import tableConfigJson from './config/documents.table.config.json';

type TableConfigJson = Omit<TableConfig, 'api'>;

function str(value: unknown): string {
  return value == null ? '' : String(value);
}

function toFilters(
  params: TableQueryParams,
  relationType: string,
  relatedId: string,
): DocumentsListFilters {
  const h = params.headerFilters ?? {};
  return {
    query: str(h.search),
    dateFrom: str(h.dateFrom),
    dateTo: str(h.dateTo),
    category: (str(h.category) || 'any') as DocumentsListFilters['category'],
    documentTypeId: str(h.documentTypeId) || 'any',
    status: (str(h.status) || 'any') as DocumentsListFilters['status'],
    relationType,
    relatedId,
  };
}

function sortRows(
  rows: DmsDocumentListRow[],
  sortField: string | undefined,
  sortOrder: 'asc' | 'desc' | undefined,
): DmsDocumentListRow[] {
  if (!sortField) return rows;
  const dir = sortOrder === 'desc' ? -1 : 1;
  return [...rows].sort(
    (a, b) =>
      String(a[sortField as keyof DmsDocumentListRow] ?? '').localeCompare(
        String(b[sortField as keyof DmsDocumentListRow] ?? ''),
        'tr',
      ) * dir,
  );
}

export function buildDocumentsTableConfig(
  role: BackOfficeRole,
  relationType: string,
  relatedId: string,
  t?: TranslateFn,
): TableConfig {
  const base = tableConfigJson as TableConfigJson;
  const allTypes = documentTypesService.list({ query: '', category: 'any' }, role);
  const advancedFilters = (base.advancedFilters ?? []).map((f) => {
    if (f.key === 'category') {
      return {
        ...f,
        options: [
          { label: t?.('dms_all_categories', 'Tüm kategoriler') ?? 'Tüm kategoriler', value: 'any' },
          ...DOCUMENT_CATEGORIES.map((c) => ({
            label: t?.(`dr_cat_${c}`, c) ?? c,
            value: c,
          })),
        ],
      };
    }
    if (f.key === 'documentTypeId') {
      return {
        ...f,
        options: [
          { label: t?.('dms_all_types', 'Tüm tipler') ?? 'Tüm tipler', value: 'any' },
          ...allTypes.map((row) => ({ label: row.name, value: row.id })),
        ],
      };
    }
    if (f.key === 'status') {
      const statuses: Array<DocumentStatus | 'any'> = ['any', 'Active', 'Archived', 'Inactive', 'Rejected', 'Expired'];
      return {
        ...f,
        options: statuses.map((s) => ({
          label: s === 'any' ? t?.('ib_all', 'Tümü') ?? 'Tümü' : t?.(`dms_status_${s}`, s) ?? s,
          value: s,
        })),
      };
    }
    return f;
  });

  return {
    ...base,
    title: t?.('m_dms', base.title as string) ?? (base.title as string),
    advancedFilters,
    api: {
      method: (params: TableQueryParams): Promise<TableApiResponse> => {
        const filters = toFilters(params, relationType, relatedId);
        const filtered = documentsService.list(role, filters);
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
