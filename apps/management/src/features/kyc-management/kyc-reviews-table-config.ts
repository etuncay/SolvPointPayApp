import type { TableApiResponse, TableConfig, TableQueryParams, TranslateFn } from '@epay/ui';
import type { BackOfficeRole } from '@epay/ui';
import { kycReviewsService } from './api';
import type { KycReviewListRow } from './domain/types';
import tableConfigJson from './config/kyc-reviews.table.config.json';

type TableConfigJson = Omit<TableConfig, 'api'>;

function sortRows(
  rows: KycReviewListRow[],
  sortField: string | undefined,
  sortOrder: 'asc' | 'desc' | undefined,
): KycReviewListRow[] {
  if (!sortField) return rows;
  const dir = sortOrder === 'desc' ? -1 : 1;
  return [...rows].sort(
    (a, b) =>
      String(a[sortField as keyof KycReviewListRow] ?? '').localeCompare(
        String(b[sortField as keyof KycReviewListRow] ?? ''),
        'tr',
      ) * dir,
  );
}

export function buildKycReviewsTableConfig(role: BackOfficeRole, t?: TranslateFn): TableConfig {
  const base = tableConfigJson as TableConfigJson;
  const localized: TableConfigJson = {
    ...base,
    title: t?.('nav_kyc', base.title as string) ?? (base.title as string),
    search: {
      ...base.search,
      placeholder:
        t?.('kyc_search_ph', base.search?.placeholder as string) ??
        (base.search?.placeholder as string),
    },
  };

  return {
    ...localized,
    api: {
      method: (params: TableQueryParams): Promise<TableApiResponse> => {
        const allRows = kycReviewsService.list(role);
        const q = String(params.headerFilters?.search ?? '').trim().toLowerCase();
        const filtered = !q
          ? allRows
          : allRows.filter((row) =>
              [row.entityNo, row.identityNo, row.displayName, row.phone, row.email]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()
                .includes(q),
            );
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
