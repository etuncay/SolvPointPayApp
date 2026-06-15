import { useMemo, useState, type CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Play, RefreshCw } from 'lucide-react';
import { Button, DynamicTable, PageHead, WalletMoneyCell } from '@epay/ui';
import { FinReconAdjustModal } from './components/adjust-modal';
import { FinReconStatusPill } from './components/reconciliation-status-pill';
import type { FinancialReconciliation } from './domain/types';
import { useFinancialReconciliations } from './hooks/use-financial-reconciliations';
import { useRole } from '@/domain/role-context';
import { buildFinancialReconciliationTableConfig } from './financial-reconciliation-table-config';

const WARN_ROW_STYLE = { background: 'color-mix(in srgb, var(--warn, #d97706) 14%, transparent)' };

function isWarnRow(row: FinancialReconciliation) {
  return row.status === 'PendingReview';
}

function cellStyle(row: FinancialReconciliation): CSSProperties | undefined {
  return isWarnRow(row) ? WARN_ROW_STYLE : undefined;
}

function diffStyle(value: number): CSSProperties | undefined {
  if (Math.abs(value) > 0.01) return { color: 'var(--danger-fg)' };
  return undefined;
}

export function FinancialReconciliationPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { role } = useRole();
  const {
    permissions,
    run,
    runLoading,
    refresh,
    adjustTarget,
    openAdjust,
    closeAdjust,
    adjust,
    adjustLoading,
  } = useFinancialReconciliations();
  const [refreshKey, setRefreshKey] = useState(0);
  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });
  const tableConfig = useMemo(
    () => buildFinancialReconciliationTableConfig(role, translate),
    [role, t, refreshKey],
  );

  const handleRun = async () => {
    if (!window.confirm(t('finrec_run_confirm'))) return;
    const result = await run();
    if (!result.ok) {
      toast.error(t(result.error ?? 'br_run_failed'));
      return;
    }
    toast.success(t('finrec_run_ok', { id: result.row.id, status: t(`finrec_status_${result.row.status}`) }));
  };

  const handleAdjust = async (description: string) => {
    const result = await adjust(description);
    if (!result.ok) {
      toast.error(t(result.error ?? 'finrec_adjust_failed'));
      return;
    }
    toast.success(t('finrec_adjust_ok'));
  };

  if (!permissions.list) {
    return (
      <div className="empty-state" style={{ padding: 48 }}>
        <h3>{t('finrec_forbidden_title')}</h3>
        <p className="t-mute">{t('finrec_forbidden_sub')}</p>
      </div>
    );
  }

  return (
    <>
      <PageHead
        title={t('s_op_recon')}
        subtitle={t('finrec_subtitle')}
        actions={
          <>
            <Button type="button" variant="ghost" onClick={() => { refresh(); setRefreshKey((k) => k + 1); }}>
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
          renderMonoWithWarn: (value, row) => (
            <span className="mono fs-12" style={cellStyle(row as FinancialReconciliation)}>
              {String(value ?? '')}
            </span>
          ),
          renderAmountWithWarn: (value, row) => (
            <span style={cellStyle(row as FinancialReconciliation)}>
              <WalletMoneyCell amount={Number(value ?? 0)} currency="TRY" lang={lang} />
            </span>
          ),
          renderDiffWithWarn: (value, row) => (
            <span
              className="mono fs-12"
              style={{
                ...cellStyle(row as FinancialReconciliation),
                ...diffStyle(Number(value ?? 0)),
              }}
            >
              {Number(value ?? 0).toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US')}
            </span>
          ),
          renderStatusWithWarn: (value, row) => (
            <span style={cellStyle(row as FinancialReconciliation)}>
              <FinReconStatusPill
                status={value as never}
                label={t(`finrec_status_${String(value)}`, String(value))}
              />
            </span>
          ),
          renderDescriptionWithWarn: (value, row) => (
            <span className="fs-12 t-soft" style={cellStyle(row as FinancialReconciliation)}>
              {String(value ?? '—')}
            </span>
          ),
          renderAction: (_value, row) => {
            const r = row as FinancialReconciliation;
            if (r.status !== 'PendingReview' || !permissions.adjust) return null;
            return (
              <Button type="button" variant="ghost" size="sm" onClick={() => openAdjust(r)}>
                {t('finrec_action_adjust')}
              </Button>
            );
          },
        }}
        locale={i18n.language}
        t={translate}
      />

      <FinReconAdjustModal
        open={adjustTarget != null}
        row={adjustTarget}
        onClose={closeAdjust}
        onConfirm={(d) => void handleAdjust(d)}
        loading={adjustLoading}
      />
    </>
  );
}
