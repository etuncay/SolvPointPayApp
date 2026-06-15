import { PieChart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DynamicTable, type TableConfig } from '@epay/ui';
import { fmtNumber } from '@/lib/format';
import type { ComplaintTypeCountRow, PanelState } from '../../domain/types';
import { ReportPanelShell } from '../report-panel-shell';

export function ComplaintTypePanel({
  state,
  onRetry,
}: {
  state?: PanelState<ComplaintTypeCountRow[]>;
  onRetry?: () => void;
}) {
  const { t, i18n } = useTranslation();
  const rows = state?.status === 'ready' ? state.data : [];
  const total = rows.reduce((s, r) => s + r.count, 0);

  return (
    <ReportPanelShell
      icon={PieChart}
      iconTone="accent"
      titleKey="scf_complaint_type"
      state={state}
      onRetry={onRetry}
      count={total}
    >
      <DynamicTable
        config={
          {
            rowKey: 'complaintType',
            hideTitleBar: true,
            hideColumnFilters: true,
            pagination: false,
            columns: [
              { key: 'complaintType', title: t('sc_col_type'), dataIndex: 'complaintType', render: 'renderType' },
              { key: 'count', title: t('scr_col_count'), dataIndex: 'count', render: 'renderCount', width: 90, align: 'right' },
            ],
            api: {
              method: async () => ({
                success: true,
                data: rows as unknown as Record<string, unknown>[],
                total: rows.length,
              }),
            },
          } satisfies TableConfig
        }
        permissions={{}}
        customFunctions={{
          renderType: (v: unknown) => t(`complaint_type_${String(v ?? '')}`, String(v ?? '')),
          renderCount: (v: unknown) => <span className="mono">{fmtNumber(Number(v ?? 0), i18n.language)}</span>,
        }}
        locale={i18n.language}
        t={(k, fb) => t(k, { defaultValue: fb ?? k })}
      />
      {rows.length === 0 && (
        <p className="t-mute" style={{ textAlign: 'center', padding: 16 }}>
          {t('scr_empty')}
        </p>
      )}
    </ReportPanelShell>
  );
}
