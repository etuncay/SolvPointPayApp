import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { DynamicTable, WalletMoneyCell } from '@epay/ui';
import { Navigate } from 'react-router-dom';
import { useRole } from '@/domain/role-context';
import {
  IntegrationDetailDrawer,
  IntegrationStatusBadge,
} from '@/features/operational-processes/shared';
import { IntegrationRowActions } from './components/integration-row-actions';
import { useAccountingIntegrations } from './hooks/use-accounting-integrations';
import { buildAccountingIntegrationsTableConfig } from './accounting-integrations-table-config';

export function AccountingIntegrationsPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { role } = useRole();
  const vm = useAccountingIntegrations(role);
  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });
  const tableConfig = useMemo(() => buildAccountingIntegrationsTableConfig(role, translate), [role, t]);

  const handleActionResult = (result: { ok: boolean; error?: string; deduplicated?: boolean }) => {
    if (result.ok && result.deduplicated) {
      toast.info(t('int_retry_dedup'));
      return;
    }
    if (result.ok) toast.success(t('kyc_action_ok'));
    else toast.error(t(result.error ?? 'ap_save_failed'));
  };

  if (!vm.permissions.list) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <DynamicTable
        config={tableConfig}
        header={{
          title: t('s_op_accounting'),
          subtitle: t('acct_subtitle'),
        }}
        permissions={{ new: false, edit: false, delete: false, view: true, export: false }}
        customFunctions={{
          renderDate: (_v, row) => <span className="mono fs-12 t-soft">{String(row.transactionAt)}</span>,
          renderTransactionType: (_v, row) => (
            <span className="fs-12">{t(`wa_tx_${String(row.transactionType)}`, String(row.transactionType))}</span>
          ),
          renderAmount: (_v, row) => (
            <WalletMoneyCell amount={Number(row.amount)} currency={String(row.currency)} lang={lang} />
          ),
          renderStatus: (_v, row) => <IntegrationStatusBadge status={row.status as never} />,
          renderLastSentAt: (_v, row) => (
            <span className="mono fs-12">
              {row.lastSentAt ? String(row.lastSentAt).slice(0, 19).replace('T', ' ') : '—'}
            </span>
          ),
          renderActions: (_v, row) => (
            <IntegrationRowActions
              status={row.status as never}
              permissions={vm.permissions}
              onView={() => vm.openDrawer(String(row.id))}
              onRetry={() => handleActionResult(vm.retry(String(row.id)))}
              onHold={() => handleActionResult(vm.hold(String(row.id)))}
              onCancel={() => handleActionResult(vm.cancel(String(row.id)))}
            />
          ),
        }}
        locale={i18n.language}
        t={translate}
        onRowClick={(row) => vm.openDrawer(String(row.id))}
      />

      <IntegrationDetailDrawer
        open={vm.drawerOpen}
        record={vm.detail}
        actionLog={vm.detail?.actionLog ?? []}
        onClose={vm.closeDrawer}
        transactionLinkLabel={vm.transactionLinkLabel}
      />
    </>
  );
}
