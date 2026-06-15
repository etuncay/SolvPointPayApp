import { useMemo, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Download } from 'lucide-react';
import {
  Button,
  DynamicTable,
  PageHead,
  WalletMoneyCell,
} from '@epay/ui';
import { Navigate } from 'react-router-dom';
import { exportCsv, type CsvColumn } from '@/lib/csv';
import { TransactionStatusPill } from '@/features/transfers/components/transaction-status-pill';
import { useRole } from '@/domain/role-context';
import type { RiskLevel } from '../shared/risk-classification';
import { CaseQuickFilters } from './components/case-quick-filters';
import { CaseStatusPill } from './components/case-status-pill';
import { FraudReportModal } from './fraud-report/fraud-report-modal';
import { isOpenCase } from './domain/case-status-groups';
import type { FraudCaseListItem } from './domain/types';
import { useFraudCases } from './hooks/use-fraud-cases';
import { buildFraudCasesTableConfig } from './fraud-cases-table-config';

const PRIORITY_KEYS: Record<RiskLevel, string> = {
  Low: 'rs_level_low',
  Medium: 'rs_level_medium',
  High: 'scf_level_High',
  Critical: 'rs_level_critical',
};

const SLA_BASE = new Date('2026-05-24T12:00:00Z').getTime();
const SLA_WARN_MS = 24 * 3_600_000;

function isSlaNear(row: FraudCaseListItem): boolean {
  if (!isOpenCase(row.caseStatus)) return false;
  const due = new Date(row.slaDueAt).getTime();
  return due <= SLA_BASE + SLA_WARN_MS;
}

const WARN_ROW_STYLE = { background: 'color-mix(in srgb, var(--warn, #d97706) 12%, transparent)' };

function cellStyle(row: FraudCaseListItem): CSSProperties | undefined {
  return isSlaNear(row) ? WARN_ROW_STYLE : undefined;
}

export function FraudCasesPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const navigate = useNavigate();
  const { role } = useRole();
  const {
    filters,
    exportRows,
    permissions,
    setShowClosed,
    setQuickFilter,
    refresh,
  } = useFraudCases();

  const [reportOpen, setReportOpen] = useState(false);
  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });
  const tableConfig = useMemo(
    () => buildFraudCasesTableConfig(role, filters, translate),
    [role, filters, t],
  );

  if (!permissions.list) {
    return <Navigate to="/" replace />;
  }

  const handleExport = () => {
    const cols: CsvColumn<FraudCaseListItem>[] = [
      { header: t('fc_fraud_report_tx'), value: (r) => r.transactionNo },
      { header: t('bm_col_transaction_date'), value: (r) => r.transactionDate },
      { header: t('col_priority'), value: (r) => r.priority },
      { header: t('col_rule'), value: (r) => r.ruleTitle },
      { header: t('fc_col_case_status'), value: (r) => r.caseStatus },
    ];
    exportCsv('fraud-cases', exportRows, cols);
    toast.success(t('fc_export_ok'));
  };

  const handleClosedToggle = () => {
    if (filters.showClosed) {
      setShowClosed(false);
      setQuickFilter('none');
    } else {
      setShowClosed(true);
    }
  };

  return (
    <>
      <PageHead
        title={t('s_rk_cases')}
        subtitle={t('fc_page_subtitle')}
        status={<span className="mono fs-11 t-mute">7.5</span>}
        actions={
          permissions.export ? (
            <Button variant="ghost" size="sm" onClick={handleExport}>
              <Download size={14} /> {t('ib_export')}
            </Button>
          ) : undefined
        }
      />

      <CaseQuickFilters
        filters={filters}
        onClosedToggle={handleClosedToggle}
        onQuickFilter={setQuickFilter}
        onFraudReport={() => setReportOpen(true)}
        canReport={permissions.fraudReport}
      />
      <DynamicTable
        config={tableConfig}
        header={{ title: '', subtitle: '' }}
        permissions={{ new: false, edit: false, delete: false, view: true, export: false }}
        customFunctions={{
          renderWithWarn: (value, row) => <span className="fs-12" style={cellStyle(row as FraudCaseListItem)}>{String(value ?? '')}</span>,
          renderMonoWithWarn: (value, row) => <span className="mono fs-12" style={cellStyle(row as FraudCaseListItem)}>{String(value ?? '')}</span>,
          renderSoftMonoWithWarn: (value, row) => <span className="mono fs-12 t-soft" style={cellStyle(row as FraudCaseListItem)}>{String(value ?? '')}</span>,
          renderMonoOrDashWithWarn: (value, row) => <span className="mono fs-12" style={cellStyle(row as FraudCaseListItem)}>{value == null || value === '' ? '—' : String(value)}</span>,
          renderPriority: (value, row) => (
            <span className="fs-12" style={cellStyle(row as FraudCaseListItem)}>
              {t(PRIORITY_KEYS[(value as RiskLevel) ?? 'Low'])}
            </span>
          ),
          renderTransactionType: (value, row) => (
            <span className="fs-12" style={cellStyle(row as FraudCaseListItem)}>
              {t(`wa_tx_${String(value)}`, String(value))}
            </span>
          ),
          renderAmountWithWarn: (_v, row) => (
            <span style={cellStyle(row as FraudCaseListItem)}>
              <WalletMoneyCell amount={Number((row as FraudCaseListItem).amount)} currency={String((row as FraudCaseListItem).currency)} lang={lang} />
            </span>
          ),
          renderChannel: (value, row) => (
            <span className="fs-12" style={cellStyle(row as FraudCaseListItem)}>
              {t(`fc_channel_${String(value)}`, String(value))}
            </span>
          ),
          renderTransactionStatus: (value, row) => (
            <span style={cellStyle(row as FraudCaseListItem)}>
              <TransactionStatusPill status={value as never} label={t(`tx_status_${String(value)}`, String(value))} />
            </span>
          ),
          renderCaseStatus: (value, row) => (
            <span style={cellStyle(row as FraudCaseListItem)}>
              <CaseStatusPill status={value as never} />
            </span>
          ),
          renderAssignee: (value, row) => (
            <span className="fs-12" style={cellStyle(row as FraudCaseListItem)}>
              {String(value ?? '—')}
            </span>
          ),
        }}
        locale={i18n.language}
        t={translate}
        onRowClick={(row) => navigate(`/risk/cases/${row.id}`)}
      />

      <FraudReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        onSaved={refresh}
      />
    </>
  );
}
