import type { TableConfig, TranslateFn } from '@epay/ui';
import documentsJson from './config/documents.table.config.json';
import { localizeDocumentsTableConfig } from './localize-config';

type TableConfigJson = Omit<TableConfig, 'api'>;

/** Yüklü belgeler tablosu — belge haritasından satır üretir. */
export function buildDocumentsTableConfig(
  rows: Record<string, unknown>[],
  t?: TranslateFn,
): TableConfig {
  const base = documentsJson as TableConfigJson;
  const localized = t ? localizeDocumentsTableConfig(base, t) : base;
  return {
    ...localized,
    api: {
      method: async () => ({ data: rows, total: rows.length, success: true }),
    },
  };
}
