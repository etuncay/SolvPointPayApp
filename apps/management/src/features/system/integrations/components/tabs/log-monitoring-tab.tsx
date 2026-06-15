import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DynamicTable, type CustomFunctions, type TableConfig } from '@epay/ui';
import { IntegrationLogDrawer } from '../integration-log-drawer';
import type { IntegrationLogEntry } from '../../domain/types';

type Props = {
  logs: IntegrationLogEntry[];
  correlationFilter: string;
  onCorrelationChange: (v: string) => void;
};

export function LogMonitoringTab({ logs, correlationFilter, onCorrelationChange }: Props) {
  const { t, i18n } = useTranslation();
  const [selected, setSelected] = useState<IntegrationLogEntry | null>(null);
  const fmt = (iso: string | null) =>
    iso
      ? new Date(iso).toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
          timeStyle: 'medium',
        })
      : '—';

  return (
    <>
      <div style={{ marginBottom: 12 }}>
        <input
          className="input fs-12 mono"
          placeholder={t('int_correlation_filter_ph')}
          value={correlationFilter}
          onChange={(e) => onCorrelationChange(e.target.value)}
        />
      </div>
      <DynamicTable
        config={
          {
            rowKey: 'id',
            hideTitleBar: true,
            hideColumnFilters: true,
            pagination: { defaultPageSize: 8, pageSizeOptions: [8, 15, 30] },
            columns: [
              { key: 'correlationId', title: t('int_log_col_correlation'), dataIndex: 'correlationId', mono: true },
              { key: 'operation', title: t('int_log_col_operation'), dataIndex: 'operation' },
              { key: 'outcome', title: t('int_log_col_outcome'), dataIndex: 'outcome' },
              { key: 'durationMs', title: t('int_log_col_duration'), dataIndex: 'durationMs', render: 'renderDuration', width: 130 },
              { key: 'retryCount', title: t('int_log_col_retry'), dataIndex: 'retryCount', width: 100 },
              { key: 'requestMasked', title: t('int_log_col_request'), dataIndex: 'requestMasked', render: 'renderRequest' },
              { key: 'createdAt', title: t('rpt_col_date'), dataIndex: 'createdAt', render: 'renderDate', mono: true, width: 130 },
            ],
            api: {
              method: async () => ({
                data: logs as unknown as Record<string, unknown>[],
                total: logs.length,
                success: true,
              }),
            },
          } satisfies TableConfig
        }
        permissions={{}}
        onRowClick={(row) => setSelected(row as unknown as IntegrationLogEntry)}
        customFunctions={
          {
            renderDuration: (val: unknown) => `${String(val ?? 0)} ms`,
            renderRequest: (val: unknown) => <span className="t-mute">{String(val ?? '')}</span>,
            renderDate: (val: unknown) => fmt((val as string | null) ?? null),
          } satisfies CustomFunctions
        }
        locale={i18n.language}
        t={(k, fb) => t(k, { defaultValue: fb ?? k })}
      />
      <IntegrationLogDrawer
        open={selected != null}
        log={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
