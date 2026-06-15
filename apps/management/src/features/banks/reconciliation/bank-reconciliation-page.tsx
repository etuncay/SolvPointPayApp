import { useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Play, RefreshCw } from 'lucide-react';
import {
  Button,
  DynamicTable,
  PageHead,
  WalletMoneyCell,
} from '@epay/ui';
import { ReconciliationStatusPill } from './components/reconciliation-status-pill';
import type { BankReconciliation } from './domain/types';
import { useBankReconciliations } from './hooks/use-bank-reconciliations';
import { useRole } from '@/domain/role-context';
import { buildBankReconciliationTableConfig } from './bank-reconciliation-table-config';

const WARN_ROW_STYLE = { background: 'color-mix(in srgb, var(--warn, #d97706) 14%, transparent)' };

function isWarnRow(row: BankReconciliation) {
  return row.status === 'Unmatched' || row.status === 'PendingReview';
}

function cellStyle(row: BankReconciliation): CSSProperties | undefined {
  return isWarnRow(row) ? WARN_ROW_STYLE : undefined;
}

export function BankReconciliationPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { role } = useRole();
  const {
    permissions,
    run,
    runLoading,
    refresh,
  } = useBankReconciliations();
  const [refreshKey, setRefreshKey] = useState(0);
  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });
  const tableConfig = useMemo(() => buildBankReconciliationTableConfig(role, translate), [role, t, refreshKey]);

  const handleRun = async () => {
    if (!window.confirm(t('br_run_confirm'))) return;
    const result = await run();
    if (!result.ok) {
      toast.error(t(result.error ?? 'br_run_failed'));
      return;
    }
    toast.success(
      t('br_run_ok', {
        matched: result.matched,
        unmatched: result.unmatched,
        processed: result.rowsProcessed,
      }),
    );
  };

  if (!permissions.list) {
    return (
      <div className="empty-state" style={{ padding: 48 }}>
        <h3>{t('ib_forbidden_title')}</h3>
        <p className="t-mute">{t('br_forbidden_sub')}</p>
      </div>
    );
  }

  return (
    <>
      <PageHead
        title={t('s_bk_recon')}
        subtitle={t('br_subtitle')}
        actions={
          <>
            <Button type="button" variant="ghost" onClick={refresh}>
              <RefreshCw size={14} /> {t('refresh_all')}
            </Button>
            {permissions.run && (
              <Button type="button" variant="primary" onClick={() => void handleRun()} disabled={runLoading}>
                <Play size={14} /> {t('br_run')}
              </Button>
            )}
          </>
        }
      />
      <DynamicTable
        config={tableConfig}
        header={{ title: '', subtitle: '' }}
        permissions={{ new: false, edit: false, delete: false, view: true, export: false }}
        customFunctions={{
          renderWithWarn: (value, row) => <span style={cellStyle(row as BankReconciliation)}>{String(value ?? '')}</span>,
          renderMonoWithWarn: (value, row) => <span className="mono fs-12" style={cellStyle(row as BankReconciliation)}>{String(value ?? '')}</span>,
          renderSoftMonoWithWarn: (value, row) => <span className="mono fs-12 t-soft" style={cellStyle(row as BankReconciliation)}>{String(value ?? '')}</span>,
          renderTxTypeWithWarn: (value, row) => <span className="fs-12" style={cellStyle(row as BankReconciliation)}>{t(`br_tx_${String(value)}`, String(value))}</span>,
          renderAmountWithWarn: (_v, row) => (
            <span style={cellStyle(row as BankReconciliation)}>
              <WalletMoneyCell amount={Number((row as BankReconciliation).amount)} currency={String((row as BankReconciliation).bankCurrency)} lang={lang} />
            </span>
          ),
          renderBankAmountWithWarn: (_v, row) => {
            const r = row as BankReconciliation;
            const diff = r.amount !== r.bankAmount;
            return (
              <span style={cellStyle(r)} className={diff ? 't-err mono fs-12' : ''}>
                <WalletMoneyCell amount={r.bankAmount} currency={r.bankCurrency} lang={lang} />
              </span>
            );
          },
          renderStatusWithWarn: (value, row) => (
            <span style={cellStyle(row as BankReconciliation)}>
              <ReconciliationStatusPill status={value as never} label={t(`br_status_${String(value)}`, String(value))} />
            </span>
          ),
          renderCaseWithWarn: (_v, row) => {
            const r = row as BankReconciliation;
            return (
              <span style={cellStyle(r)}>
                {r.caseId != null && r.caseNo ? (
                  <Link to={`/support/cases/${r.caseId}`} className="mono fs-12">
                    {r.caseNo}
                  </Link>
                ) : (
                  <span className="dash">—</span>
                )}
              </span>
            );
          },
        }}
        locale={i18n.language}
        t={translate}
      />
    </>
  );
}
