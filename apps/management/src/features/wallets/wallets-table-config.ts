import type { BackOfficeRole, TableApiResponse, TableConfig, TableQueryParams, TranslateFn } from '@epay/ui';
import type { WalletTypeCode } from '@epay/ui';
import { walletsService } from './api';
import { getVisibleCategories } from './domain/role-visibility';
import { DEFAULT_WALLET_FILTERS, type WalletFilters, type WalletListItem } from './domain/types';
import tableConfigJson from './config/wallets.table.config.json';

type TableConfigJson = Omit<TableConfig, 'api'>;

const WALLET_TYPE_CODES: WalletTypeCode[] = [
  'customer_main',
  'customer_savings',
  'agent_advance',
  'agent_commission',
  'system_reserve',
  'system_revenue',
  'system_suspense',
  'system_settlement',
];

function str(value: unknown): string {
  return value == null ? '' : String(value);
}

function toFilters(params: TableQueryParams): WalletFilters {
  const header = params.headerFilters ?? {};
  const tab = params.tabFilters ?? {};
  return {
    ...DEFAULT_WALLET_FILTERS,
    query: str(header.search),
    cat: str(tab.cat) || str(header.cat) || 'all',
    ccy: str(header.ccy) || 'all',
    type: str(header.type) || 'any',
    state: str(header.state) || 'any',
    from: str(header.createdFrom),
    to: str(header.createdTo),
  };
}

function sortRows(
  rows: WalletListItem[],
  sortField: string | undefined,
  sortOrder: 'asc' | 'desc' | undefined,
): WalletListItem[] {
  if (!sortField) return rows;
  const dir = sortOrder === 'desc' ? -1 : 1;
  return [...rows].sort(
    (a, b) =>
      String(a[sortField as keyof WalletListItem] ?? '').localeCompare(
        String(b[sortField as keyof WalletListItem] ?? ''),
        'tr',
      ) * dir,
  );
}

function typeOptionsForCat(cat: string, visibleCategories: WalletListItem['cat'][]) {
  const cats = cat === 'all' ? visibleCategories : [cat as WalletListItem['cat']];
  return WALLET_TYPE_CODES.filter((code) => {
    const catKey = code.startsWith('system_') ? 'system' : code.startsWith('agent_') ? 'agent' : 'customer';
    return cats.includes(catKey);
  });
}

export function buildWalletsTableConfig(
  role: BackOfficeRole,
  t?: TranslateFn,
  onQuery?: (filters: WalletFilters) => void,
): TableConfig {
  const base = tableConfigJson as TableConfigJson;
  const visibleCategories = getVisibleCategories(role);
  const stats = walletsService.getStats(role);

  const tabs = (base.tabs ?? []).filter(
    (tab) => tab.key === 'all' || visibleCategories.includes(tab.key as WalletListItem['cat']),
  );

  const advancedFilters = (base.advancedFilters ?? []).map((f) => {
    if (f.key === 'type') {
      const codes = typeOptionsForCat('all', visibleCategories);
      return {
        ...f,
        options: [
          { label: t?.('ib_all', 'Tümü') ?? 'Tümü', value: 'any' },
          ...codes.map((code) => ({ label: t?.(`wt_${code}`, code) ?? code, value: code })),
        ],
      };
    }
    return f;
  });

  return {
    ...base,
    title: t?.('nav_wallets', base.title as string) ?? (base.title as string),
    tabs,
    advancedFilters,
    api: {
      method: (params: TableQueryParams): Promise<TableApiResponse> => {
        const filters = toFilters(params);
        onQuery?.(filters);
        const filtered = walletsService.list(filters, role);
        const sorted = sortRows(filtered, params.sortField, params.sortOrder);
        const start = (params.page - 1) * params.pageSize;
        const pageRows = sorted.slice(start, start + params.pageSize);
        return Promise.resolve({
          success: true,
          data: pageRows as unknown as Record<string, unknown>[],
          total: sorted.length,
          meta: {
            allCount: stats.totalCount,
            customerCount: stats.customerCount,
            agentCount: stats.agentCount,
            systemCount: stats.systemCount,
          },
        });
      },
    },
  };
}
