import { ThumbsUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@epay/ui';
import { fmtAge, fmtMoney } from '@/lib/format';
import { useWidgetData } from '../hooks/use-dashboard';
import { WidgetTable } from './widget-table';
import type { WidgetProps } from './widget-props';

export function WMyApprovals({ detailLevel, ...props }: WidgetProps) {
  const { t, i18n } = useTranslation();
  const { data, error, loading, refreshedAt, refresh } = useWidgetData('my_approvals');
  if (!data && !loading && !error) return null;

  const compact = detailLevel === 'compact';

  const rows = (data ?? []).map((r) => {
    if (compact) {
      return [
        <span key="id" className="mono">
          {r.id}
        </span>,
        <span key="reason">
          {r.type}
          <span className="t-mute" style={{ marginLeft: 6, fontSize: 11 }}>
            · {r.requester.split(/\s+/)[0]}
          </span>
        </span>,
        r.amount != null ? fmtMoney(r.amount, i18n.language) : '—',
        fmtAge(r.age, i18n.language),
      ];
    }
    return [
      <span key="id" className="mono">
        {r.id}
      </span>,
      r.type,
      r.requester,
      r.amount != null ? fmtMoney(r.amount, i18n.language) : '—',
      fmtAge(r.age, i18n.language),
      <Badge key="p" tone={r.priority === 'high' ? 'danger' : r.priority === 'med' ? 'warn' : 'default'}>
        {r.priority === 'high' ? t('scf_level_High') : r.priority === 'med' ? t('rs_level_medium') : t('rs_level_low')}
      </Badge>,
    ];
  });

  return (
    <WidgetTable
      {...props}
      detailLevel={detailLevel}
      widgetCode="my_approvals"
      icon={ThumbsUp}
      iconTone="accent"
      titleKey="w_my_approvals"
      count={data?.length}
      countTone="accent"
      loading={loading}
      error={error}
      onRetry={refresh}
      refreshedAt={refreshedAt}
      sortable
      rowIds={data?.map((r) => r.id)}
      searchKeys={data?.map((r) => `${r.id} ${r.type} ${r.requester}`)}
      columns={
        compact
          ? [
              { label: t('rpt_col_reference'), width: 100 },
              { label: t('col_reason') },
              { label: t('rpt_col_amount'), align: 'right' },
              { label: t('col_age'), width: 70, align: 'right' },
            ]
          : [
              { label: t('rpt_col_reference'), width: 100 },
              { label: t('col_reason') },
              { label: t('col_requester') },
              { label: t('rpt_col_amount'), align: 'right' },
              { label: t('col_age'), align: 'right' },
              { label: t('col_priority') },
            ]
      }
      rows={rows}
    />
  );
}
