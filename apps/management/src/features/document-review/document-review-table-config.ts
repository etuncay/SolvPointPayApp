import type { BackOfficeRole } from '@epay/ui';
import type { TableApiResponse, TableConfig, TableQueryParams, TranslateFn } from '@epay/ui';
import { documentReviewService } from './api';
import { DOCUMENT_TYPES_BY_CATEGORY } from './domain/types';
import type { ReviewQueueFilters, ReviewQueueItem } from './domain/types';
import { localizeDocumentReviewTableConfig } from './localize-config';
import tableConfigJson from './config/document-review.table.config.json';

type TableConfigJson = Omit<TableConfig, 'api'>;

function str(value: unknown): string {
  return value == null ? '' : String(value);
}

function toFilters(params: TableQueryParams): ReviewQueueFilters {
  const header = params.headerFilters ?? {};
  return {
    query: str(header.search),
    customerNo: str(header.customerNo),
    category: str(header.category) || 'any',
    documentType: str(header.documentType) || 'any',
    approvalStatus: str(header.approvalStatus) || 'any',
  };
}

function documentTypeOptions() {
  const names = [
    ...new Set(Object.values(DOCUMENT_TYPES_BY_CATEGORY).flat()),
  ].sort((a, b) => a.localeCompare(b, 'tr'));
  return names.map((name) => ({ label: name, value: name }));
}

function sortRows(
  rows: ReviewQueueItem[],
  sortField: string | undefined,
  sortOrder: 'asc' | 'desc' | undefined,
): ReviewQueueItem[] {
  if (!sortField) return rows;
  const dir = sortOrder === 'desc' ? -1 : 1;
  return [...rows].sort((a, b) => {
    const av = a[sortField as keyof ReviewQueueItem];
    const bv = b[sortField as keyof ReviewQueueItem];
    if (typeof av === 'boolean' && typeof bv === 'boolean') return (Number(av) - Number(bv)) * dir;
    return str(av).localeCompare(str(bv), 'tr') * dir;
  });
}

/** JSON tablo config + mock kuyruk binder (spec §8 sıralaması korunur). */
export function buildDocumentReviewTableConfig(
  role: BackOfficeRole,
  t?: TranslateFn,
): TableConfig {
  const base = tableConfigJson as TableConfigJson;
  const localized = t ? localizeDocumentReviewTableConfig(base, t) : base;

  const withDocumentTypes: TableConfigJson = {
    ...localized,
    advancedFilters: localized.advancedFilters?.map((f) =>
      f.key === 'documentType' ? { ...f, options: documentTypeOptions() } : f,
    ),
  };

  return {
    ...withDocumentTypes,
    api: {
      method: (params: TableQueryParams): Promise<TableApiResponse> => {
        const rows = documentReviewService.listReviewQueue(role, toFilters(params));
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
