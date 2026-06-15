import { useMemo, useState } from 'react';
import { Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fmtMoney } from '@/lib/format';
import { WidgetSegment } from '../components/widget-segment';
import { useWidgetNavigation } from '../hooks/use-widget-navigation';
import { useWidgetData } from '../hooks/use-dashboard';
import { WidgetShell } from './widget-shell';
import { type WidgetProps } from './widget-props';
import type { TopCustomerRow } from '../domain/types';

type Tab = 'sent' | 'received' | 'withdrawn';

export function WTopCustomers({ detailLevel, onFullscreen, mode = 'compact' }: WidgetProps) {
  const { t, i18n } = useTranslation();
  const { goToWidget } = useWidgetNavigation();
  const { data, error, loading, refreshedAt, refresh } = useWidgetData('top_customers');
  const [tab, setTab] = useState<Tab>('sent');

  const sorted = useMemo(() => {
    const list = [...(data ?? [])];
    list.sort((a, b) => (b[tab] ?? 0) - (a[tab] ?? 0));
    return list;
  }, [data, tab]);

  if (!data && !loading && !error) return null;

  const maxRows = mode === 'scr_fullscreen' ? sorted.length : 10;
  const visible = sorted.slice(0, maxRows);
  const maxVal = visible[0]?.[tab] ?? 1;

  const timeLabel = refreshedAt
    ? refreshedAt.toLocaleTimeString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : t('now');

  const segment = (
    <WidgetSegment
      value={tab}
      onChange={(id) => setTab(id as Tab)}
      options={[
        { id: 'sent', label: t('dash_seg_sender') },
        { id: 'received', label: t('dash_seg_receiver') },
        { id: 'withdrawn', label: t('dash_seg_withdrawer') },
      ]}
    />
  );

  return (
    <WidgetShell
      icon={Users}
      iconTone="info"
      titleKey="w_top_customers"
      meta={detailLevel === 'compact' ? segment : undefined}
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
          className="link-btn"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit' }}
          onClick={() => goToWidget('top_customers')}
        >
          {t('view_all')} →
        </button>
      }
    >
      {detailLevel !== 'compact' && <div style={{ padding: '0 14px 8px' }}>{segment}</div>}
      <div className="card-body padded" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {visible.map((row, i) => (
          <RankRow key={`${row.name}-${i}`} row={row} tab={tab} maxVal={maxVal} rank={i + 1} barTone="accent" />
        ))}
      </div>
    </WidgetShell>
  );
}

function RankRow({
  row,
  tab,
  maxVal,
  rank,
  barTone,
}: {
  row: TopCustomerRow;
  tab: Tab;
  maxVal: number;
  rank: number;
  barTone: 'accent' | 'warn';
}) {
  const { i18n } = useTranslation();
  const value = row[tab] ?? 0;
  const pct = maxVal > 0 ? (value / maxVal) * 100 : 0;

  return (
    <div
      className="dashboard-rank-row linkable"
      style={{ gridTemplateColumns: '22px 1fr auto' }}
    >
      <span className="mono fs-11 t-mute" style={{ textAlign: 'right' }}>
        {rank}
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.name}</span>
          {row.id && <span className="mono fs-11 t-mute">{row.id}</span>}
        </div>
        <div className={`dashboard-rank-bar dashboard-rank-bar--${barTone}`}>
          <span style={{ width: `${pct}%` }} />
        </div>
      </div>
      <span className="amount fs-12">{fmtMoney(value, i18n.language)}</span>
    </div>
  );
}
