import { Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DynamicTable, type TableConfig } from '@epay/ui';
import { useWidgetNavigation } from '../hooks/use-widget-navigation';
import { useWidgetData } from '../hooks/use-dashboard';
import { WidgetShell } from './widget-shell';
import type { WidgetProps } from './widget-props';

export function WSysHealth(props: WidgetProps) {
  const { t, i18n } = useTranslation();
  const { onFullscreen } = props;
  const { data, error, loading, refreshedAt, refresh } = useWidgetData('sys_health');
  const { goToWidget } = useWidgetNavigation();

  const health = data;
  const timeLabel = refreshedAt
    ? refreshedAt.toLocaleTimeString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : t('now');

  return (
    <WidgetShell
      icon={Activity}
      iconTone="danger"
      titleKey="w_sys_health"
      loading={loading}
      error={error}
      onRetry={refresh}
      onFullscreen={onFullscreen}
      footerLeft={
        <>
          {t('last_updated')} · {timeLabel}
        </>
      }
      footerLink={
        <button
          type="button"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit' }}
          onClick={() => goToWidget('sys_health')}
        >
          {t('view_all')} →
        </button>
      }
    >
      {health && (
        <>
          <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="kpi">
              <span className="kpi-label">{t('sj_perf_success')}</span>
              <span className="kpi-value sm">{health.successRate}%</span>
            </div>
            <div className="kpi">
              <span className="kpi-label">p95</span>
              <span className="kpi-value sm">{health.p95}ms</span>
            </div>
            <div className="kpi">
              <span className="kpi-label">p99</span>
              <span className="kpi-value sm">{health.p99}ms</span>
            </div>
            <div className="kpi">
              <span className="kpi-label">{t('error_rate')}</span>
              <span className="kpi-value sm">{health.errorRate}%</span>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <DynamicTable
              config={
                {
                  rowKey: 'svc',
                  hideTitleBar: true,
                  hideColumnFilters: true,
                  pagination: false,
                  columns: [
                    { key: 'svc', title: t('col_service'), dataIndex: 'svc', mono: true },
                    { key: 'errors', title: t('col_errors'), dataIndex: 'errors' },
                    { key: 'p95', title: 'p95', dataIndex: 'p95', render: 'renderMs' },
                    { key: 'p99', title: 'p99', dataIndex: 'p99', render: 'renderMs' },
                  ],
                  api: {
                    method: async () => ({
                      success: true,
                      data: health.topErrors as unknown as Record<string, unknown>[],
                      total: health.topErrors.length,
                    }),
                  },
                } satisfies TableConfig
              }
              permissions={{}}
              customFunctions={{ renderMs: (v: unknown) => `${String(v ?? 0)}ms` }}
              locale={i18n.language}
              t={(k, fb) => t(k, { defaultValue: fb ?? k })}
            />
          </div>
        </>
      )}
    </WidgetShell>
  );
}
