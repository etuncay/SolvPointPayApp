import type { TableConfig, TranslateFn } from '@epay/ui';
import { withdrawalService } from './api';
import feesJson from './config/withdrawal-fees.table.config.json';
import { localizeWithdrawalFeesConfig } from './localize-config';

type TableConfigJson = Omit<TableConfig, 'api'>;

export function buildWithdrawalFeesTableConfig(currency: string, t?: TranslateFn): TableConfig {
  const base = feesJson as TableConfigJson;
  const localized = t ? localizeWithdrawalFeesConfig(base, t) : base;
  return {
    ...localized,
    api: {
      method: async () => {
        const rows = withdrawalService.getWithdrawalFees(currency);
        return { data: rows as unknown as Record<string, unknown>[], total: rows.length, success: true };
      },
    },
  };
}
