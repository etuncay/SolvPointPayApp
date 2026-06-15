import { BarChart3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fmtMoney, fmtNumber } from '@/lib/format';
import { useWidgetNavigation } from '../hooks/use-widget-navigation';
import { useWidgetData } from '../hooks/use-dashboard';
import { WidgetShell } from './widget-shell';
import type { WidgetProps } from './widget-props';

export function WDailyVolume(props: WidgetProps) {
  const { t, i18n } = useTranslation();
  const { onFullscreen } = props;
  const { data, error, loading, refreshedAt, refresh } = useWidgetData('daily_volume');
  const { goToWidget } = useWidgetNavigation();

  const hours = data ?? [];
  const totSuccess = hours.reduce((s, h) => s + h.success, 0);
  const totFailed = hours.reduce((s, h) => s + h.failed, 0);
  const totAmount = hours.reduce((s, h) => s + h.amount, 0);
  const successRate = totSuccess + totFailed > 0 ? (totSuccess / (totSuccess + totFailed)) * 100 : 0;

  const timeLabel = refreshedAt
    ? refreshedAt.toLocaleTimeString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : t('now');

  return (
    <WidgetShell
      icon={BarChart3}
      iconTone="ok"
      titleKey="w_daily_volume"
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
          onClick={() => goToWidget('daily_volume')}
        >
          {t('view_all')} →
        </button>
      }
    >
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)', paddingBottom: 0 }}>
        <div className="kpi">
          <span className="kpi-label">{t('today_count')}</span>
          <span className="kpi-value sm">{fmtNumber(totSuccess + totFailed, i18n.language)}</span>
        </div>
        <div className="kpi">
          <span className="kpi-label">{t('today_amount')}</span>
          <span className="kpi-value sm">{fmtMoney(totAmount, i18n.language)}</span>
        </div>
        <div className="kpi">
          <span className="kpi-label">{t('sj_perf_success')}</span>
          <span className="kpi-value sm">{successRate.toFixed(2)}%</span>
        </div>
      </div>
      <div style={{ height: 120, display: 'flex', alignItems: 'flex-end', gap: 2, padding: '12px 0' }}>
        {hours.map((h) => (
          <div
            key={h.hour}
            title={`${h.hour}:00`}
            style={{
              flex: 1,
              height: `${(h.success / 1200) * 100}%`,
              minHeight: 4,
              background: 'var(--accent)',
              borderRadius: 2,
              opacity: 0.85,
            }}
          />
        ))}
      </div>
    </WidgetShell>
  );
}
