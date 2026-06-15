import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Download, RefreshCw, Search, X } from 'lucide-react';
import {
  Button,
  DynamicTable,
  KpiCard,
  KpiStrip,
  PageHead,
  WalletMoneyCell,
} from '@epay/ui';
import { fmtNumber } from '@/lib/format';
import { exportCsv, type CsvColumn } from '@/lib/csv';
import { useRole } from '@/domain/role-context';
import { TransactionStatusPill } from './components/transaction-status-pill';
import type { TransactionListItem } from './domain/types';
import { useTransfers } from './hooks/use-transfers';
import { buildTransfersTableConfig } from './transfers-table-config';

export function TransfersPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const navigate = useNavigate();
  const { role } = useRole();
  const {
    stats,
    permissions,
    exportRows,
    refresh,
  } = useTransfers();
  const [refreshKey, setRefreshKey] = useState(0);
  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });
  const tableConfig = useMemo(
    () => buildTransfersTableConfig(role, translate),
    [role, t, refreshKey],
  );

  const handleExport = async () => {
    if (!permissions.export) return;
    const data = await exportRows();
    const csvColumns: CsvColumn<TransactionListItem>[] = [
      { header: t('wa_col_tx_no'), value: (r) => r.transactionNo },
      { header: t('ap_col_date'), value: (r) => r.createdAt },
      { header: t('tx_col_sender_cust'), value: (r) => String(r.senderCustomerNo ?? '') },
      { header: t('tx_col_sender_wallet'), value: (r) => r.senderWalletNo ?? '' },
      { header: t('tx_col_sender_name'), value: (r) => r.senderName },
      { header: t('tx_col_receiver_cust'), value: (r) => String(r.receiverCustomerNo ?? '') },
      { header: t('tx_col_receiver_wallet'), value: (r) => r.receiverWalletNo ?? '' },
      { header: t('tx_col_receiver_name'), value: (r) => r.receiverName },
      { header: t('wa_col_sender_agent'), value: (r) => String(r.senderAgentNo ?? '') },
      { header: t('wa_col_receiver_agent'), value: (r) => String(r.receiverAgentNo ?? '') },
      { header: t('cba_col_iban'), value: (r) => r.iban ?? '' },
      { header: t('wa_col_type'), value: (r) => r.transactionType },
      { header: t('cba_col_currency'), value: (r) => r.sourceCurrency },
      { header: t('rpt_col_amount'), value: (r) => r.principalAmount },
      { header: t('rpt_col_status'), value: (r) => r.status },
    ];
    exportCsv('transfers-export', data, csvColumns);
    toast.success(t('tx_export_ok'));
  };

  return (
    <>
      <PageHead
        title={t('tx_title')}
        subtitle={t('tx_subtitle')}
        actions={
          <>
            {permissions.export && (
              <Button type="button" onClick={handleExport}>
                <Download size={13} /> {t('cust_export')}
              </Button>
            )}
            <Button type="button" onClick={() => { refresh(); setRefreshKey((k) => k + 1); }}>
              <RefreshCw size={13} /> {t('refresh_all')}
            </Button>
          </>
        }
      />

      <KpiStrip>
        <KpiCard
          label={t('tx_kpi_pending')}
          value={fmtNumber(stats.pending, lang)}
          sub={t('tx_kpi_pending_sub')}
        />
        <KpiCard
          label={t('tx_kpi_onhold')}
          value={fmtNumber(stats.onHold, lang)}
          sub={t('tx_kpi_onhold_sub')}
        />
        <KpiCard
          label={t('today')}
          value={fmtNumber(stats.todayCount, lang)}
          sub={t('tx_kpi_today_sub')}
        />
      </KpiStrip>
      <DynamicTable
        config={tableConfig}
        header={{ title: '', subtitle: '' }}
        permissions={{ new: false, edit: false, delete: false, view: true, export: false }}
        customFunctions={{
          renderMono: (value) => <span className="mono fs-12">{String(value ?? '')}</span>,
          renderSoftMono: (value) => <span className="mono fs-12 t-soft">{String(value ?? '')}</span>,
          renderMonoOrDash: (value) => <span className="mono fs-12">{value == null || value === '' ? '—' : String(value)}</span>,
          renderTxType: (value) => t(`wa_tx_${String(value)}`, String(value)),
          renderAmount: (_v, row) => (
            <WalletMoneyCell
              amount={Number(row.principalAmount)}
              currency={String(row.sourceCurrency)}
              lang={lang}
            />
          ),
          renderStatus: (value) => (
            <TransactionStatusPill
              status={value as never}
              label={t(`tx_status_${String(value)}`, String(value))}
            />
          ),
        }}
        locale={i18n.language}
        t={translate}
        onRowClick={(row) => navigate(`/transfers/${row.id}`)}
      />
    </>
  );
}
