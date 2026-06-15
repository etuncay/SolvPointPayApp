import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DynamicTable, Field, type TableConfig } from '@epay/ui';
import type { FxRate } from '../domain/types';
import { todayRateDate } from '../domain/work-hours';

type Props = {
  rows: FxRate[];
  rateDate: string;
  onRateDateChange: (date: string) => void;
  lang: string;
};

export function RateHistoryPanel({ rows, rateDate, onRateDateChange, lang }: Props) {
  const { t, i18n } = useTranslation();
  const translate = (key: string, fallback?: string) => t(key, { defaultValue: fallback ?? key });
  const tableConfig = useMemo<TableConfig>(
    () => ({
      title: t('fx_panel_rate_history'),
      rowKey: 'id',
      pagination: { defaultPageSize: 10, pageSizeOptions: [10, 20, 50] },
      hideColumnFilters: true,
      columns: [
        { key: 'rateDate', title: t('fx_col_rate_date'), dataIndex: 'rateDate', sortable: true, width: 130, render: 'renderMono' },
        { key: 'currency', title: t('cba_col_currency'), dataIndex: 'currency', sortable: true, width: 90 },
        { key: 'source', title: t('fx_col_source'), dataIndex: 'source', sortable: true, width: 120, render: 'renderSource' },
        { key: 'buyRate', title: t('fx_col_buy'), dataIndex: 'buyRate', sortable: true, width: 110, render: 'renderRate4' },
        { key: 'sellRate', title: t('fx_col_sell'), dataIndex: 'sellRate', sortable: true, width: 110, render: 'renderRate4' },
        { key: 'marginedBuyInside', title: t('fx_col_margined_buy_in'), dataIndex: 'marginedBuyInside', sortable: true, width: 130, render: 'renderRate4' },
        { key: 'marginedSellInside', title: t('fx_col_margined_sell_in'), dataIndex: 'marginedSellInside', sortable: true, width: 130, render: 'renderRate4' },
        { key: 'marginedBuyOutside', title: t('fx_col_margined_buy_out'), dataIndex: 'marginedBuyOutside', sortable: true, width: 140, render: 'renderRate4' },
        { key: 'marginedSellOutside', title: t('fx_col_margined_sell_out'), dataIndex: 'marginedSellOutside', sortable: true, width: 140, render: 'renderRate4' },
        { key: 'lastUpdated', title: t('fx_col_last_updated'), dataIndex: 'lastUpdated', sortable: true, width: 150, render: 'renderSoftMono' }
      ],
      api: {
        method: async (params) => {
          const sorted = [...rows];
          if (params.sortField) {
            const dir = params.sortOrder === 'desc' ? -1 : 1;
            sorted.sort((a, b) => String((a as Record<string, unknown>)[params.sortField!] ?? '').localeCompare(String((b as Record<string, unknown>)[params.sortField!] ?? ''), 'tr') * dir);
          }
          const start = (params.page - 1) * params.pageSize;
          return { success: true, data: sorted.slice(start, start + params.pageSize) as unknown as Record<string, unknown>[], total: sorted.length };
        },
      },
    }),
    [rows, t],
  );

  return (
    <div className="form-card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        <h3 className="fs-14">{t('fx_panel_rate_history')}</h3>
        <Field label={t('fx_col_rate_date')}>
          <input
            className="input"
            type="date"
            value={rateDate}
            max={todayRateDate()}
            onChange={(e) => onRateDateChange(e.target.value)}
          />
        </Field>
      </div>
      <DynamicTable
        config={tableConfig}
        header={{ title: '', subtitle: '' }}
        permissions={{ new: false, edit: false, delete: false, view: true, export: false }}
        customFunctions={{
          renderMono: (value) => <span className="mono fs-12">{String(value ?? '')}</span>,
          renderSoftMono: (value) => <span className="mono fs-12 t-soft">{String(value ?? '')}</span>,
          renderSource: (value) => t(`fx_source_${String(value)}`, String(value)),
          renderRate4: (value) => <span className="mono fs-12">{Number(value ?? 0).toFixed(4)}</span>,
        }}
        locale={i18n.language}
        t={translate}
      />
    </div>
  );
}
