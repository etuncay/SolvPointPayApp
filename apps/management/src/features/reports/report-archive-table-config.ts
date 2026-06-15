import type { TableConfig, TranslateFn } from '@epay/ui';
import archiveJson from './config/report-archive.table.config.json';

type TableConfigJson = Omit<TableConfig, 'api'>;

export function buildReportArchiveTableConfig(t?: TranslateFn): TableConfigJson {
  const base = archiveJson as TableConfigJson;
  if (!t) return base;
  return {
    ...base,
    columns: base.columns.map((c) => ({
      ...c,
      title:
        c.key === 'reportCode'
          ? t('rpt_col_report')
          : c.key === 'generatedAt'
            ? t('rpt_col_date')
            : c.key === 'rowCount'
              ? t('rpt_col_rows')
              : c.key === 'correlationId'
                ? t('rpt_col_correlation')
                : c.title,
    })),
  };
}

