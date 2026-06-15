import type { TableConfig, TranslateFn } from '@epay/ui';
import failedLoginsJson from './config/failed-logins.table.config.json';
import type { FailedLoginRow } from '@/features/dashboard/domain/types';
import { localizeFailedLoginsTableConfig } from './localize-config';

type TableConfigJson = Omit<TableConfig, 'api'>;

export function buildFailedLoginsTableConfig(rows: FailedLoginRow[], t?: TranslateFn): TableConfig {
  const base = failedLoginsJson as TableConfigJson;
  const localized = t ? localizeFailedLoginsTableConfig(base, t) : base;
  return {
    ...localized,
    api: {
      method: async () => ({
        data: rows as unknown as Record<string, unknown>[],
        total: rows.length,
        success: true,
      }),
    },
  };
}
