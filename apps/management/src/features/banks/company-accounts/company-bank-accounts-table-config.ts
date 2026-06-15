import type { TableApiResponse, TableConfig, TableQueryParams, TranslateFn } from '@epay/ui';
import { companyBankAccountsService } from './api';
import type { CompanyBankAccount, CompanyBankAccountFilters } from './domain/types';
import { DEFAULT_COMPANY_BANK_ACCOUNT_FILTERS, BANK_ACCOUNT_TYPE_OPTIONS } from './domain/types';
import tableConfigJson from './config/company-bank-accounts.table.config.json';

type TableConfigJson = Omit<TableConfig, 'api'>;

function str(value: unknown): string {
  return value == null ? '' : String(value);
}

function toFilters(params: TableQueryParams): CompanyBankAccountFilters {
  const h = params.headerFilters ?? {};
  return {
    ...DEFAULT_COMPANY_BANK_ACCOUNT_FILTERS,
    query: str(h.search),
    accountType: (str(h.accountType) || DEFAULT_COMPANY_BANK_ACCOUNT_FILTERS.accountType) as CompanyBankAccountFilters['accountType'],
    currency: (str(h.currency) || DEFAULT_COMPANY_BANK_ACCOUNT_FILTERS.currency) as CompanyBankAccountFilters['currency'],
    status: (str(h.status) || DEFAULT_COMPANY_BANK_ACCOUNT_FILTERS.status) as CompanyBankAccountFilters['status'],
  };
}

function sortRows(
  rows: CompanyBankAccount[],
  sortField: string | undefined,
  sortOrder: 'asc' | 'desc' | undefined,
): CompanyBankAccount[] {
  if (!sortField) return rows;
  const dir = sortOrder === 'desc' ? -1 : 1;
  return [...rows].sort((a, b) => {
    const av = (a as Record<string, unknown>)[sortField];
    const bv = (b as Record<string, unknown>)[sortField];
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
    return str(av).localeCompare(str(bv), 'tr') * dir;
  });
}

export function buildCompanyBankAccountsTableConfig(
  t?: TranslateFn,
  onQuery?: (filters: CompanyBankAccountFilters) => void,
): TableConfig {
  const base = tableConfigJson as TableConfigJson;

  const localized: TableConfigJson = {
    ...base,
    title: t?.('s_bk_accounts', base.title as string) ?? (base.title as string),
    search: base.search
      ? {
          ...base.search,
          placeholder: t?.('cba_search_ph', base.search.placeholder as string) ?? base.search.placeholder,
        }
      : base.search,
    advancedFilters: (base.advancedFilters ?? []).map((f) => {
      if (f.key === 'accountType') {
        return {
          ...f,
          label: t?.('cba_col_type', f.label as string) ?? f.label,
          options: [
            { label: t?.('cba_all_types', 'Tümü') ?? 'Tümü', value: 'any' },
            ...BANK_ACCOUNT_TYPE_OPTIONS.map((tp) => ({
              label: t?.(`cba_type_${tp}`, tp) ?? tp,
              value: tp,
            })),
          ],
        };
      }
      if (f.key === 'currency') {
        return {
          ...f,
          label: t?.('cba_col_currency', f.label as string) ?? f.label,
          options: [
            { label: t?.('cba_all_currencies', 'Tümü') ?? 'Tümü', value: 'any' },
            ...(f.options ?? []).filter((o) => o.value !== 'any'),
          ],
        };
      }
      if (f.key === 'status') {
        return {
          ...f,
          label: t?.('scf_col_status', f.label as string) ?? f.label,
          options: [
            { label: t?.('ib_all', 'Tümü') ?? 'Tümü', value: 'any' },
            { label: t?.('ib_status_Active', 'Aktif') ?? 'Aktif', value: 'Active' },
            { label: t?.('ib_status_Inactive', 'Pasif') ?? 'Pasif', value: 'Inactive' },
          ],
        };
      }
      return f;
    }),
    toolbar: {
      ...base.toolbar,
      new: base.toolbar?.new
        ? { ...base.toolbar.new, label: t?.('cba_add', base.toolbar.new.label as string) ?? base.toolbar.new.label }
        : base.toolbar?.new,
    },
  };

  return {
    ...localized,
    api: {
      method: (params: TableQueryParams): Promise<TableApiResponse> => {
        const filters = toFilters(params);
        onQuery?.(filters);

        const filtered = companyBankAccountsService.list(filters);
        const sorted = sortRows(filtered, params.sortField, params.sortOrder);
        const start = (params.page - 1) * params.pageSize;
        const pageRows = sorted.slice(start, start + params.pageSize);

        const activeCount = companyBankAccountsService.list({ ...DEFAULT_COMPANY_BANK_ACCOUNT_FILTERS, status: 'Active' }).length;

        return Promise.resolve({
          success: true,
          data: pageRows as unknown as Record<string, unknown>[],
          total: sorted.length,
          meta: { activeCount },
        });
      },
    },
  };
}

