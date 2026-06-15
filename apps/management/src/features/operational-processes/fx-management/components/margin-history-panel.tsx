import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DynamicTable, type TableConfig } from '@epay/ui';
import type { FxMarginHistory } from '../domain/types';

type Props = {
  rows: FxMarginHistory[];
};

export function MarginHistoryPanel({ rows }: Props) {
  const { t, i18n } = useTranslation();
  const translate = (key: string, fallback?: string) => t(key, { defaultValue: fallback ?? key });
  const tableConfig = useMemo<TableConfig>(
    () => ({
      title: t('fx_panel_margin_history'),
      rowKey: 'id',
      pagination: { defaultPageSize: 10, pageSizeOptions: [10, 20, 50] },
      hideColumnFilters: true,
      columns: [
        { key: 'at', title: t('rpt_col_date'), dataIndex: 'at', sortable: true, width: 140, render: 'renderMono' },
        { key: 'currency', title: t('cba_col_currency'), dataIndex: 'currency', sortable: true, width: 90 },
        { key: 'workHours', title: t('fx_col_work_hours'), dataIndex: 'workHours', sortable: true, width: 120, render: 'renderWorkHours' },
        { key: 'buyFixedMargin', title: t('fx_col_buy_fixed'), dataIndex: 'buyFixedMargin', sortable: true, width: 120, render: 'renderRate4' },
        { key: 'buyVariableMarginPct', title: t('fx_col_buy_var'), dataIndex: 'buyVariableMarginPct', sortable: true, width: 120, render: 'renderPct2' },
        { key: 'sellFixedMargin', title: t('fx_col_sell_fixed'), dataIndex: 'sellFixedMargin', sortable: true, width: 120, render: 'renderRate4' },
        { key: 'sellVariableMarginPct', title: t('fx_col_sell_var'), dataIndex: 'sellVariableMarginPct', sortable: true, width: 120, render: 'renderPct2' },
        { key: 'approvalRef', title: t('fx_col_approval_ref'), dataIndex: 'approvalRef', sortable: true, width: 140, render: 'renderMonoOrDash' }
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
      <h3 className="fs-14" style={{ marginBottom: 16 }}>
        {t('fx_panel_margin_history')}
      </h3>
      <DynamicTable
        config={tableConfig}
        header={{ title: '', subtitle: '' }}
        permissions={{ new: false, edit: false, delete: false, view: true, export: false }}
        customFunctions={{
          renderMono: (value) => <span className="mono fs-12">{String(value ?? '')}</span>,
          renderMonoOrDash: (value) => <span className="mono fs-12">{String(value ?? '—')}</span>,
          renderWorkHours: (value) => t(`fx_work_${String(value)}`, String(value)),
          renderRate4: (value) => <span className="mono fs-12">{Number(value ?? 0).toFixed(4)}</span>,
          renderPct2: (value) => <span className="mono fs-12">{Number(value ?? 0).toFixed(2)}%</span>,
        }}
        locale={i18n.language}
        t={translate}
      />
    </div>
  );
}
