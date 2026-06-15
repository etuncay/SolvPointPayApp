import { useTranslation } from 'react-i18next';
import { Archive, Download } from 'lucide-react';
import { DynamicTable, FormCard, IconButton, type CustomFunctions, type TableConfig } from '@epay/ui';
import { buildCsv, downloadCsv, todayStamp } from '@/lib/csv';
import type { ReportArchiveEntry } from '../domain/types';
import { buildReportArchiveTableConfig } from '../report-archive-table-config';

export function ReportArchiveList({
  entries,
  onReExport,
}: {
  entries: ReportArchiveEntry[];
  onReExport?: (entry: ReportArchiveEntry) => void;
}) {
  const { t } = useTranslation();
  if (entries.length === 0) return null;

  const exportEntry = (entry: ReportArchiveEntry) => {
    const cols = entry.resultSnapshot.columns.map((c) => ({
      header: t(c.labelKey),
      value: (row: Record<string, unknown>) => {
        const v = row[c.key];
        if (v == null) return null;
        if (typeof v === 'string' || typeof v === 'number') return v;
        return String(v);
      },
    }));
    downloadCsv(
      `${entry.reportCode}_${entry.id}_${todayStamp()}.csv`,
      buildCsv(entry.resultSnapshot.rows, cols),
    );
    onReExport?.(entry);
  };

  return (
    <FormCard
      title={t('rpt_archive_title')}
      icon={<Archive size={13} />}
      meta={<span className="mono fs-11 t-mute">{entries.length}</span>}
      padless
    >
      <DynamicTable
        config={
          {
            ...buildReportArchiveTableConfig((k, fb) => t(k, { defaultValue: fb ?? k })),
            api: {
              method: async () => ({
                data: entries as unknown as Record<string, unknown>[],
                total: entries.length,
                success: true,
              }),
            },
          } satisfies TableConfig
        }
        permissions={{}}
        customFunctions={
          {
            renderReportCode: (val: unknown) => <span className="rpt-archive-code fs-12">{t(`rpt_${String(val)}`, String(val))}</span>,
            renderGeneratedAt: (val: unknown) =>
              typeof val === 'string' ? (
                new Date(val).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })
              ) : (
                '—'
              ),
            renderRowCount: (val: unknown) => <span className="mono fs-12">{String(val ?? '')}</span>,
            renderActions: (_val: unknown, row: Record<string, unknown>) => {
              const e = row as unknown as ReportArchiveEntry;
              return (
                <IconButton aria-label="CSV" onClick={() => exportEntry(e)}>
                  <Download size={14} />
                </IconButton>
              );
            },
          } satisfies CustomFunctions
        }
        locale="tr"
        t={(k, fb) => t(k, { defaultValue: fb ?? k })}
      />
    </FormCard>
  );
}
