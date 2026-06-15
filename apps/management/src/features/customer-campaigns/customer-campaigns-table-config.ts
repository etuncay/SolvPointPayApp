import type { TableApiResponse, TableConfig, TableQueryParams, TranslateFn } from '@epay/ui';
import type { BackOfficeRole } from '@epay/ui';
import { customerCampaignsService } from './api';
import type { Campaign, CampaignFilters } from './domain/types';
import { DEFAULT_CAMPAIGN_FILTERS } from './domain/types';
import tableConfigJson from './config/customer-campaigns.table.config.json';
import { localizeCustomerCampaignsTableConfig } from './localize-config';

type TableConfigJson = Omit<TableConfig, 'api'>;

function str(value: unknown): string {
  return value == null ? '' : String(value);
}

function toFilters(params: TableQueryParams): CampaignFilters {
  const h = params.headerFilters ?? {};
  return {
    ...DEFAULT_CAMPAIGN_FILTERS,
    query: str(h.search).trim(),
    transactionType: str(h.transactionType) || DEFAULT_CAMPAIGN_FILTERS.transactionType,
    currency: str(h.currency) || DEFAULT_CAMPAIGN_FILTERS.currency,
    status: str(h.status) || DEFAULT_CAMPAIGN_FILTERS.status,
  };
}

function sortRows(
  rows: Campaign[],
  sortField: string | undefined,
  sortOrder: 'asc' | 'desc' | undefined,
): Campaign[] {
  if (!sortField) return rows;
  const dir = sortOrder === 'desc' ? -1 : 1;
  return [...rows].sort((a, b) => {
    const av = (a as Record<string, unknown>)[sortField];
    const bv = (b as Record<string, unknown>)[sortField];

    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
    return str(av).localeCompare(str(bv), 'tr') * dir;
  });
}

export function buildCustomerCampaignsTableConfig(
  t?: TranslateFn,
  onQuery?: (filters: CampaignFilters) => void,
  _role?: BackOfficeRole,
): TableConfig {
  const base = tableConfigJson as TableConfigJson;
  const localized = t ? localizeCustomerCampaignsTableConfig(base, t) : base;

  return {
    ...localized,
    api: {
      method: (params: TableQueryParams): Promise<TableApiResponse> => {
        const filters = toFilters(params);
        onQuery?.(filters);

        const filtered = customerCampaignsService.list(filters);
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

