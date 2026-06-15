import { useTranslation } from 'react-i18next';
import { Button } from '@epay/ui';
import { AlertTriangle, Archive, Flag, Sparkles, UserCheck } from 'lucide-react';
import type { CaseListFilters, CaseQuickFilter } from '../domain/types';

type Props = {
  filters: CaseListFilters;
  onClosedToggle: () => void;
  onQuickFilter: (q: CaseQuickFilter) => void;
  onFraudReport: () => void;
  canReport: boolean;
};

export function CaseQuickFilters({
  filters,
  onClosedToggle,
  onQuickFilter,
  onFraudReport,
  canReport,
}: Props) {
  const { t } = useTranslation();
  const closedActive = filters.showClosed || filters.quickFilter === 'closed';

  const chip = (key: CaseQuickFilter, label: string, icon?: React.ReactNode) => {
    const active = filters.quickFilter === key && !closedActive;
    return (
      <Button
        key={key}
        type="button"
        variant={active ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => onQuickFilter(active ? 'none' : key)}
      >
        {icon}
        {label}
      </Button>
    );
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
      <Button
        type="button"
        variant={closedActive ? 'primary' : 'ghost'}
        size="sm"
        onClick={onClosedToggle}
      >
        <Archive size={14} />
        {t('fc_filter_closed')}
      </Button>
      {chip('high_priority', t('fc_filter_high'), <Flag size={14} />)}
      {chip('new', t('fc_filter_new'), <Sparkles size={14} />)}
      {chip('sla_due', t('fc_filter_sla'), <AlertTriangle size={14} />)}
      {chip('assigned_me', t('fc_filter_mine'), <UserCheck size={14} />)}
      {canReport && (
        <Button type="button" variant="ghost" size="sm" onClick={onFraudReport}>
          {t('fc_fraud_report_btn')}
        </Button>
      )}
    </div>
  );
}
