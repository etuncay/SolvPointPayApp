import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { DynamicTable } from '@epay/ui';
import { Navigate } from 'react-router-dom';
import { useRole } from '@/domain/role-context';
import {
  IntegrationDetailDrawer,
  IntegrationRowActions,
  IntegrationStatusBadge,
} from '@/features/operational-processes/shared';
import { useBtransIntegrations } from './hooks/use-btrans-integrations';
import { buildBtransIntegrationsTableConfig } from './btrans-integrations-table-config';

export function BtransIntegrationsPage() {
  const { t, i18n } = useTranslation();
  const { role } = useRole();
  const vm = useBtransIntegrations(role);
  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });
  const tableConfig = useMemo(() => buildBtransIntegrationsTableConfig(role, translate), [role, t]);

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
          title: t('s_op_btrans'),
          subtitle: t('btrans_subtitle'),
        }}
        permissions={{ new: false, edit: false, delete: false, view: true, export: false }}
        customFunctions={{
          renderDate: (_v, row) => <span className="mono fs-12">{String(row.reportDate)}</span>,
          renderReportName: (_v, row) => (
            <span className="fs-12">{t(`btrans_report_${String(row.reportName)}`, String(row.reportName))}</span>
          ),
          renderStatus: (_v, row) => <IntegrationStatusBadge status={row.status as never} />,
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
      />
    </>
  );
}
