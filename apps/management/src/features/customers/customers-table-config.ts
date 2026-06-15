import type { TableApiResponse, TableConfig, TableQueryParams, TranslateFn } from '@epay/ui';
import { customersService } from './api/customers-service';
import {
  EMPTY_ADV_FILTERS,
  EMPTY_COLUMN_FILTERS,
  type CustomerAdvFilters,
  type CustomerFilters,
  type CustomerListItem,
  type EntityStatusFilter,
} from './domain/types';
import { localizeCustomersTableConfig } from './localize-config';
import tableConfigJson from './config/customers.table.config.json';

type TableConfigJson = Omit<TableConfig, 'api'>;

/** Sıralanabilir kolon anahtarı → satır alanı eşlemesi (created → createdAt). */
const SORT_FIELD: Record<string, keyof CustomerListItem> = {
  id: 'id',
  name: 'name',
  type: 'type',
  campaign: 'campaign',
  kyc: 'kyc',
  riskScore: 'riskScore',
  riskSeg: 'riskSeg',
  created: 'createdAt',
  status: 'status',
};

function str(value: unknown): string {
  return value == null ? '' : String(value);
}

/** headerFilters/tabFilters → CustomerFilters (mock adapter sözleşmesi). */
function toFilters(params: TableQueryParams): CustomerFilters {
  const header = params.headerFilters ?? {};
  const tab = params.tabFilters ?? {};

  const status = (str(tab.status) || 'all') as EntityStatusFilter;
  const query = str(header.search);

  const advanced: CustomerAdvFilters = {
    ...EMPTY_ADV_FILTERS,
    type: str(header.type) || 'any',
    kyc: str(header.kyc) || 'any',
    risk: str(header.risk) || 'any',
    campaign: str(header.campaign) || 'any',
    from: str(header.createdFrom),
    to: str(header.createdTo),
  };

  return { status, query, advanced, columns: EMPTY_COLUMN_FILTERS };
}

function sortRows(
  rows: CustomerListItem[],
  sortField: string | undefined,
  sortOrder: 'asc' | 'desc' | undefined,
): CustomerListItem[] {
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

/** Mevcut filtreye göre distinct kampanya adları (gelişmiş filtre seçeneği). */
function campaignOptions() {
  const all = customersService.exportRows({
    status: 'all',
    query: '',
    advanced: EMPTY_ADV_FILTERS,
    columns: EMPTY_COLUMN_FILTERS,
  });
  const names = [...new Set(all.map((c) => c.campaign).filter((c): c is NonNullable<typeof c> => c != null))].sort();
  return names.map((name) => ({ label: name, value: name }));
}

/** JSON tablo config + mock servis binder (client-side sıralama/sayfalama). */
export function buildCustomersTableConfig(
  t?: TranslateFn,
  onQuery?: (filters: CustomerFilters) => void,
): TableConfig {
  const base = tableConfigJson as TableConfigJson;
  const localized = t ? localizeCustomersTableConfig(base, t) : base;

  const withCampaigns: TableConfigJson = {
    ...localized,
    advancedFilters: localized.advancedFilters?.map((f) =>
      f.key === 'campaign' ? { ...f, options: campaignOptions() } : f,
    ),
  };

  return {
    ...withCampaigns,
    api: {
      method: (params: TableQueryParams): Promise<TableApiResponse> => {
        const filters = toFilters(params);
        onQuery?.(filters);
        const { rows, counts } = customersService.list(filters);
        const sorted = sortRows(rows, params.sortField, params.sortOrder);
        const start = (params.page - 1) * params.pageSize;
        const pageRows = sorted.slice(start, start + params.pageSize);

        return Promise.resolve({
          data: pageRows as unknown as Record<string, unknown>[],
          total: sorted.length,
          success: true,
          meta: {
            activeCount: counts.active,
            inactiveCount: counts.inactive,
            blockedCount: counts.blocked,
            closedCount: counts.closed,
            allCount: counts.all,
          },
        });
      },
    },
  };
}
