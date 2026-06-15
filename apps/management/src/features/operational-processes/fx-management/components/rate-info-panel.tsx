import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DynamicTable, type TableConfig } from '@epay/ui';
import type { FxRate } from '../domain/types';
import { isInsideWorkHours } from '../domain/work-hours';

type Props = {
  rates: FxRate[];
  lang: string;
};

export function RateInfoPanel({ rates, lang }: Props) {
  const { t, i18n } = useTranslation();
  const activeInside = isInsideWorkHours();
  const translate = (key: string, fallback?: string) => t(key, { defaultValue: fallback ?? key });
  const tableConfig = useMemo<TableConfig>(
    () => ({
      title: t('fx_panel_rates'),
      rowKey: 'id',
      pagination: { defaultPageSize: 10, pageSizeOptions: [10, 20, 50] },
      hideColumnFilters: true,
      columns: [
        { key: 'rateDate', title: t('fx_col_rate_date'), dataIndex: 'rateDate', sortable: true, width: 130, render: 'renderMono' },
        { key: 'currency', title: t('cba_col_currency'), dataIndex: 'currency', sortable: true, width: 90 },
        { key: 'source', title: t('fx_col_source'), dataIndex: 'source', sortable: true, width: 120, render: 'renderSource' },
        { key: 'buyRate', title: t('fx_col_buy'), dataIndex: 'buyRate', sortable: true, width: 120, render: 'renderRate4' },
        { key: 'sellRate', title: t('fx_col_sell'), dataIndex: 'sellRate', sortable: true, width: 120, render: 'renderRate4' },
        { key: 'marginedBuy', title: t('fx_col_margined_buy'), dataIndex: 'marginedBuyInside', sortable: false, width: 170, render: 'renderMarginedBuy' },
        { key: 'marginedSell', title: t('fx_col_margined_sell'), dataIndex: 'marginedSellInside', sortable: false, width: 150, render: 'renderMarginedSell' },
        { key: 'lastUpdated', title: t('fx_col_last_updated'), dataIndex: 'lastUpdated', sortable: true, width: 150, render: 'renderSoftMono' }
      ],
      api: {
        method: async (params) => {
          const rows = [...rates];
          if (params.sortField) {
            const dir = params.sortOrder === 'desc' ? -1 : 1;
            rows.sort((a, b) => String((a as Record<string, unknown>)[params.sortField!] ?? '').localeCompare(String((b as Record<string, unknown>)[params.sortField!] ?? ''), 'tr') * dir);
          }
          const start = (params.page - 1) * params.pageSize;
          return { success: true, data: rows.slice(start, start + params.pageSize) as unknown as Record<string, unknown>[], total: rows.length };
        },
      },
    }),
    [rates, t],
  );

  return (
    <div className="form-card" style={{ padding: 20 }}>
      <h3 className="fs-14" style={{ marginBottom: 16 }}>
        {t('fx_panel_rates')}
      </h3>
      <DynamicTable
        config={tableConfig}
        header={{ title: '', subtitle: '' }}
        permissions={{ new: false, edit: false, delete: false, view: true, export: false }}
        customFunctions={{
          renderMono: (value) => <span className="mono fs-12">{String(value ?? '')}</span>,
          renderSoftMono: (value) => <span className="mono fs-12 t-soft">{String(value ?? '')}</span>,
          renderSource: (value) => t(`fx_source_${String(value)}`, String(value)),
          renderRate4: (value) => <span className="mono fs-12">{Number(value ?? 0).toFixed(4)}</span>,
          renderMarginedBuy: (_value, row) => (
            <span className="mono fs-12">
              {(activeInside ? Number((row as FxRate).marginedBuyInside) : Number((row as FxRate).marginedBuyOutside)).toFixed(4)}
              <span className="t-mute fs-11" style={{ marginLeft: 6 }}>
                ({activeInside ? t('fx_work_Inside') : t('fx_work_Outside')})
              </span>
            </span>
          ),
          renderMarginedSell: (_value, row) => (
            <span className="mono fs-12">
              {(activeInside ? Number((row as FxRate).marginedSellInside) : Number((row as FxRate).marginedSellOutside)).toFixed(4)}
            </span>
          ),
        }}
        locale={i18n.language}
        t={translate}
      />
    </div>
  );
}
