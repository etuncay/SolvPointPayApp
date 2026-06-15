import type { TableConfig, TranslateFn } from '@epay/ui';
import { transferService } from './api';
import feesJson from './config/transfer-fees.table.config.json';
import { localizeFeesTableConfig } from './localize-config';
import type { TransferVariant } from './domain/types';

type TableConfigJson = Omit<TableConfig, 'api'>;

export function buildTransferFeesTableConfig(
  variant: TransferVariant,
  currency: string,
  t?: TranslateFn,
): TableConfig {
  const base = feesJson as TableConfigJson;
  const localized = t ? localizeFeesTableConfig(base, t) : base;
  return {
    ...localized,
    api: {
      method: async () => {
        const rows = transferService.getTransferFees(variant, currency);
        return { data: rows as unknown as Record<string, unknown>[], total: rows.length, success: true };
      },
    },
  };
}
