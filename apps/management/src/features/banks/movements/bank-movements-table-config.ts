import type { TableApiResponse, TableConfig, TableQueryParams, TranslateFn } from '@epay/ui';
import type { BackOfficeRole } from '@epay/ui';
import { bankMovementsService } from './api';
import type { BankAccountMovement, BankMovementFilters } from './domain/types';
import { DEFAULT_BANK_MOVEMENT_FILTERS } from './domain/types';
import tableConfigJson from './config/bank-movements.table.config.json';

type TableConfigJson = Omit<TableConfig, 'api'>;

function str(value: unknown): string {
  return value == null ? '' : String(value);
}

function toFilters(params: TableQueryParams): BankMovementFilters {
  const h = params.headerFilters ?? {};
  return {
    ...DEFAULT_BANK_MOVEMENT_FILTERS,
    query: str(h.search),
    paymentStatus: (str(h.paymentStatus) || 'all') as BankMovementFilters['paymentStatus'],
    bankTransferMethod: (str(h.bankTransferMethod) || 'all') as BankMovementFilters['bankTransferMethod'],
    currency: (str(h.currency) || 'all') as BankMovementFilters['currency'],
    amountMin: str(h.amountMin),
    amountMax: str(h.amountMax),
    transactionFrom: str(h.transactionFrom),
    transactionTo: str(h.transactionTo),
  };
}

function sortRows(
  rows: BankAccountMovement[],
  sortField: string | undefined,
  sortOrder: 'asc' | 'desc' | undefined,
): BankAccountMovement[] {
  if (!sortField) return rows;
  const dir = sortOrder === 'desc' ? -1 : 1;
  return [...rows].sort(
    (a, b) =>
      String(a[sortField as keyof BankAccountMovement] ?? '').localeCompare(
        String(b[sortField as keyof BankAccountMovement] ?? ''),
        'tr',
      ) * dir,
  );
}

export function buildBankMovementsTableConfig(role: BackOfficeRole, t?: TranslateFn): TableConfig {
  const base = tableConfigJson as TableConfigJson;
  return {
    ...base,
    title: t?.('s_bk_movements', base.title as string) ?? (base.title as string),
    search: {
      ...base.search,
      placeholder:
        t?.('bm_search_ph', base.search?.placeholder as string) ??
        (base.search?.placeholder as string),
    },
    api: {
      method: (params: TableQueryParams): Promise<TableApiResponse> => {
        const filters = toFilters(params);
        const filtered = bankMovementsService.list(filters, role);
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
