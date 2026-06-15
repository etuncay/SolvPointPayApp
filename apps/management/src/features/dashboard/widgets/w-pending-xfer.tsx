import { ArrowRightLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@epay/ui';
import { flagify, fmtAge, fmtMoney } from '@/lib/format';
import { DashCustAvatar } from '../components/dash-cust-avatar';
import { useWidgetData } from '../hooks/use-dashboard';
import { WidgetTable } from './widget-table';
import type { WidgetProps } from './widget-props';

export function WPendingXfer({ detailLevel, ...props }: WidgetProps) {
  const { t, i18n } = useTranslation();
  const { data, error, loading, refreshedAt, refresh } = useWidgetData('pending_xfer');
  if (!data && !loading && !error) return null;

  const compact = detailLevel === 'compact';

  const rows = (data ?? []).map((r, i) => {
    const corridor = (
      <span
        key="c"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
        }}
      >
        {flagify(r.from ?? '')} {r.from} → {flagify(r.to ?? '')} {r.to}
      </span>
    );

    if (compact) {
      return [
        <span key="id" className="mono">
          {r.id}
        </span>,
        <DashCustAvatar key="cust" name={r.customer} idx={i} />,
        corridor,
        fmtMoney(r.amount, i18n.language),
        fmtAge(r.age, i18n.language),
      ];
    }

    return [
      <span key="id" className="mono">
        {r.id}
      </span>,
      <DashCustAvatar key="cust" name={r.customer} idx={i} />,
      corridor,
      fmtMoney(r.amount, i18n.language),
      fmtAge(r.age, i18n.language),
      <Badge key="s" tone={r.state === 'review' ? 'info' : 'warn'}>
        {r.state === 'review' ? t('s_review') : t('nt_status_Pending')}
      </Badge>,
    ];
  });

  return (
    <WidgetTable
      {...props}
      detailLevel={detailLevel}
      widgetCode="pending_xfer"
      icon={ArrowRightLeft}
      iconTone="warn"
      titleKey="w_pending_xfer"
      count={data?.length}
      countTone="warn"
      loading={loading}
      error={error}
      onRetry={refresh}
      refreshedAt={refreshedAt}
      sortable
      rowIds={data?.map((r) => r.id)}
      searchKeys={data?.map((r) => `${r.id} ${r.customer} ${r.from} ${r.to}`)}
      columns={
        compact
          ? [
              { label: t('rpt_col_reference'), width: 100 },
              { label: t('scf_entity_customer') },
              { label: t('col_corridor') },
              { label: t('rpt_col_amount'), align: 'right' },
              { label: t('col_age'), width: 60, align: 'right' },
            ]
          : [
              { label: t('rpt_col_reference'), width: 100 },
              { label: t('scf_entity_customer') },
              { label: t('col_corridor') },
              { label: t('rpt_col_amount'), align: 'right' },
              { label: t('col_age'), align: 'right' },
              { label: t('rpt_col_status') },
            ]
      }
      rows={rows}
    />
  );
}
