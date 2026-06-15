import type { BackOfficeRole, TableApiResponse, TableConfig, TableQueryParams, TranslateFn } from '@epay/ui';
import { walletsService } from './api';
import type { WalletActivity, WalletActivityFilters } from './domain/activity-types';
import { DEFAULT_WALLET_ACTIVITY_FILTERS } from './domain/activity-types';
import tableConfigJson from './config/wallet-activities.table.config.json';

type TableConfigJson = Omit<TableConfig, 'api'>;

function str(value: unknown): string {
  return value == null ? '' : String(value);
}

function toFilters(params: TableQueryParams): WalletActivityFilters {
  const header = params.headerFilters ?? {};
  return {
    ...DEFAULT_WALLET_ACTIVITY_FILTERS,
    query: str(header.search),
    direction: str(header.direction) || 'all',
    status: str(header.status) || 'all',
    transactionType: str(header.transactionType) || 'all',
    currency: str(header.currency) || 'all',
    from: str(header.createdFrom),
    to: str(header.createdTo),
  };
}

function sortRows(
  rows: WalletActivity[],
  sortField: string | undefined,
  sortOrder: 'asc' | 'desc' | undefined,
): WalletActivity[] {
  if (!sortField) return rows;
  const dir = sortOrder === 'desc' ? -1 : 1;
  return [...rows].sort(
    (a, b) =>
      String(a[sortField as keyof WalletActivity] ?? '').localeCompare(
        String(b[sortField as keyof WalletActivity] ?? ''),
        'tr',
      ) * dir,
  );
}

export function buildWalletActivitiesTableConfig(
  walletId: number,
  role: BackOfficeRole,
  t?: TranslateFn,
  onQuery?: (filters: WalletActivityFilters) => void,
): TableConfig {
  const base = tableConfigJson as TableConfigJson;
  return {
    ...base,
    title: t?.('wd_activities', base.title as string) ?? (base.title as string),
    api: {
      method: (params: TableQueryParams): Promise<TableApiResponse> => {
        const filters = toFilters(params);
        onQuery?.(filters);
        const result = walletsService.listActivities(walletId, filters, role);
        if (!result.ok) {
          return Promise.resolve({ success: false, data: [], total: 0 });
        }
        const sorted = sortRows(result.rows, params.sortField, params.sortOrder);
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
