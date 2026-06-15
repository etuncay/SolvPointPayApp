import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, FileSpreadsheet } from 'lucide-react';
import { Button, DynamicTable, FormCard, type TableConfig } from '@epay/ui';
import { buildCsv, downloadCsv, todayStamp } from '@/lib/csv';
import type { ReportResult } from '../domain/types';

const PREVIEW_MAX = 100;

export function ReportPreviewGrid({
  result,
  titleKey,
}: {
  result: ReportResult | null;
  titleKey?: string;
}) {
  const { t, i18n } = useTranslation();

  const visibleRows = result?.rows.slice(0, PREVIEW_MAX) ?? [];
  const tableConfig = useMemo<TableConfig>(
    () => ({
      title: titleKey ? t(titleKey) : t('rpt_preview_title'),
      rowKey: 'id',
      pagination: { defaultPageSize: 20, pageSizeOptions: [10, 20, 50, 100] },
      hideColumnFilters: true,
      columns: (result?.columns ?? []).map((col) => ({
        key: col.key,
        dataIndex: col.key,
        title: t(col.labelKey),
        sortable: true,
        minWidth: 140,
        render: 'renderCell',
      })),
      api: {
        method: async (params) => {
          const rows = [...visibleRows];
          if (params.sortField) {
            const dir = params.sortOrder === 'desc' ? -1 : 1;
            rows.sort(
              (a, b) =>
                String(a[params.sortField!] ?? '').localeCompare(String(b[params.sortField!] ?? ''), 'tr') *
                dir,
            );
          }
          const start = (params.page - 1) * params.pageSize;
          return { success: true, data: rows.slice(start, start + params.pageSize), total: rows.length };
        },
      },
    }),
    [result, visibleRows, t, titleKey],
  );

  if (!result) return null;

  const translate = (key: string, fallback?: string) => t(key, { defaultValue: fallback ?? key });

  const exportCsv = () => {
    const cols = result.columns.map((c) => ({
      header: t(c.labelKey),
      value: (row: Record<string, unknown>) => {
        const v = row[c.key];
        if (v == null) return null;
        if (typeof v === 'string' || typeof v === 'number') return v;
        return String(v);
      },
    }));
    downloadCsv(`${result.correlationId}_${todayStamp()}.csv`, buildCsv(result.rows, cols));
  };

  return (
    <FormCard
      title={titleKey ? t(titleKey) : t('rpt_preview_title')}
      icon={<FileSpreadsheet size={13} />}
      meta={<span className="mono fs-11 t-mute">{result.rows.length}</span>}
      padless
    >
      <div className="rpt-preview-toolbar">
        <div>
          <p className="rpt-preview-meta">
            {t('rpt_preview_meta', {
              count: result.rows.length,
              correlationId: result.correlationId,
            })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="button" variant="primary" size="sm" onClick={exportCsv}>
            <Download size={14} /> CSV
          </Button>
          <Button type="button" variant="ghost" size="sm" disabled title={t('rpt_pdf_soon')}>
            PDF
          </Button>
        </div>
      </div>

      {result.summary && (
        <div className="rpt-preview-summary">
          {Object.entries(result.summary).map(([k, v]) => (
            <div key={k} className="rpt-preview-summary-item">
              <label>{k}</label>
              <span>{v.toLocaleString('tr-TR')}</span>
            </div>
          ))}
        </div>
      )}

      <DynamicTable
        config={tableConfig}
        header={{ title: '', subtitle: '' }}
        permissions={{ new: false, edit: false, delete: false, view: true, export: false }}
        customFunctions={{
          renderCell: (value) => <span className="fs-12 mono">{String(value ?? '—')}</span>,
        }}
        locale={i18n.language}
        t={translate}
      />

      {result.rows.length > PREVIEW_MAX && (
        <p className="rpt-preview-foot">{t('rpt_preview_truncated', { max: PREVIEW_MAX })}</p>
      )}
    </FormCard>
  );
}
