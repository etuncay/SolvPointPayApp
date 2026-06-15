import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Download, Plus } from 'lucide-react';
import {
  Button,
  DynamicTable,
  PageHead,
} from '@epay/ui';
import { fmtNumber } from '@/lib/format';
import { exportCsv, type CsvColumn } from '@/lib/csv';
import { Navigate } from 'react-router-dom';
import { useRole } from '@/domain/role-context';
import type { RiskLevel } from '../shared/risk-classification';
import { FraudRuleStatusPill } from './components/fraud-rule-status-pill';
import { FraudScopePill } from './components/fraud-scope-pill';
import { formatCaseReviewDuration } from './domain/format-duration';
import { getFraudRulesPermissions } from './domain/permissions';
import type { FraudRuleListItem, FraudRuleStatus, FraudScope } from './domain/types';
import { useFraudRules } from './hooks/use-fraud-rules';
import { buildFraudRulesTableConfig } from './fraud-rules-table-config';

const SCOPE_CHIPS: Array<FraudScope | 'all'> = ['all', 'Onboarding', 'Remittance'];
const STATUS_CHIPS: Array<FraudRuleStatus | 'all'> = ['all', 'Active', 'Passive'];

const PRIORITY_KEYS: Record<RiskLevel, string> = {
  Low: 'rs_level_low',
  Medium: 'rs_level_medium',
  High: 'scf_level_High',
  Critical: 'rs_level_critical',
};

export function FraudRulesPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const navigate = useNavigate();
  const { role } = useRole();
  const permissions = getFraudRulesPermissions(role);
  const { filters, exportRows } = useFraudRules();

  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });
  const tableConfig = useMemo(() => buildFraudRulesTableConfig(role, translate), [role, t]);

  const csvColumns: CsvColumn<FraudRuleListItem>[] = useMemo(
    () => [
      { header: t('fr_col_trigger_order'), value: (r) => String(r.triggerOrder) },
      { header: t('fr_col_title'), value: (r) => r.title },
      { header: t('fr_col_scope'), value: (r) => r.scope },
      { header: t('rpt_col_status'), value: (r) => r.status },
      { header: t('col_priority'), value: (r) => r.priority },
      { header: t('rc_col_tp'), value: (r) => String(r.truePositive) },
      { header: t('fr_col_fp'), value: (r) => String(r.falsePositive) },
      { header: t('rc_col_cases_opened'), value: (r) => String(r.casesOpened) },
      {
        header: t('fr_col_avg_duration'),
        value: (r) => formatCaseReviewDuration(r.avgCaseReviewMinutes, lang),
      },
    ],
    [t, lang],
  );

  if (!permissions.list) {
    return <Navigate to="/" replace />;
  }

  const handleExport = () => {
    exportCsv('dolandiricilik-kurallari', exportRows(), csvColumns);
    toast.success(t('fr_export_ok'));
  };

  const prioritySeg = (p: RiskLevel) =>
    ({ Low: 'low', Medium: 'med', High: 'high', Critical: 'critical' })[p];

  return (
    <>
      <PageHead
        title={t('s_rk_fraud')}
        subtitle={t('fr_page_subtitle')}
        status={<span className="mono fs-11 t-mute">7.4</span>}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            {permissions.export && (
              <Button variant="ghost" size="sm" onClick={handleExport}>
                <Download size={14} /> {t('cust_export')}
              </Button>
            )}
            <Button variant="primary" size="sm" onClick={() => navigate('/risk/fraud-rules/new')}>
              <Plus size={14} /> {t('fr_new_rule')}
            </Button>
          </div>
        }
      />

      <DynamicTable
        config={tableConfig}
        header={{ title: '', subtitle: '' }}
        permissions={{ new: true, edit: false, delete: false, view: true, export: false }}
        customFunctions={{
          renderMono: (value) => <span className="mono fs-12">{fmtNumber(Number(value ?? 0), lang)}</span>,
          renderScope: (_v, row) => <FraudScopePill scope={row.scope as FraudScope} />,
          renderStatus: (_v, row) => <FraudRuleStatusPill status={row.status as FraudRuleStatus} />,
          renderPriority: (_v, row) => (
            <span className={`risk-seg ${prioritySeg(row.priority as RiskLevel)}`}>
              {t(PRIORITY_KEYS[row.priority as RiskLevel])}
            </span>
          ),
          renderAvgDuration: (_v, row) => (
            <span className="mono fs-12">
              {formatCaseReviewDuration(Number(row.avgCaseReviewMinutes ?? 0), lang)}
            </span>
          ),
        }}
        locale={i18n.language}
        t={translate}
        onNew={() => navigate('/risk/fraud-rules/new')}
        onRowClick={(row) => navigate(`/risk/fraud-rules/${row.id}`)}
      />

      <p className="fs-12 t-mute" style={{ marginTop: 12 }}>
        {t('fr_trigger_order_note')}
      </p>
    </>
  );
}
