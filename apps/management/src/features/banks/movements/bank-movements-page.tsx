import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Download, RefreshCw } from 'lucide-react';
import {
  Button,
  DynamicTable,
  PageHead,
  WalletMoneyCell,
} from '@epay/ui';
import { exportCsv, type CsvColumn } from '@/lib/csv';
import { PaymentStatusPill } from './components/payment-status-pill';
import type { BankAccountMovement } from './domain/types';
import { useBankMovements } from './hooks/use-bank-movements';
import { buildBankMovementsTableConfig } from './bank-movements-table-config';

export function BankMovementsPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const {
    permissions,
    exportRows,
    refresh,
  } = useBankMovements();
  const [refreshKey, setRefreshKey] = useState(0);
  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });
  const tableConfig = useMemo(() => buildBankMovementsTableConfig('finance', translate), [t, refreshKey]);

  const csvColumns: CsvColumn<BankAccountMovement>[] = useMemo(
    () => [
      { header: t('bm_col_source_bank'), value: (r) => r.sourceBank },
      { header: t('bm_col_source_iban'), value: (r) => r.sourceIban },
      { header: t('bm_col_target_bank'), value: (r) => r.targetBank },
      { header: t('bm_col_target_iban'), value: (r) => r.targetIban },
      { header: t('cba_col_currency'), value: (r) => r.currency },
      { header: t('rpt_col_amount'), value: (r) => String(r.amount) },
      { header: t('bm_col_status'), value: (r) => r.paymentStatus },
      { header: t('bm_col_method'), value: (r) => r.bankTransferMethod },
      { header: t('bm_col_created'), value: (r) => r.createdAt },
      { header: t('bm_col_transaction_date'), value: (r) => r.transactionDate },
      { header: t('bm_col_reference'), value: (r) => r.referenceNo },
      { header: t('bm_col_name'), value: (r) => r.name },
      { header: t('bm_col_tax'), value: (r) => r.taxNo },
      { header: t('bm_col_bank_tx'), value: (r) => r.bankTransactionNo },
      { header: t('rpt_col_desc'), value: (r) => r.description ?? '' },
      { header: t('bm_col_error'), value: (r) => r.errorMessage ?? '' },
    ],
    [t],
  );

  const handleExport = () => {
    const data = exportRows();
    exportCsv('banka-hesap-hareketleri', data, csvColumns);
    toast.success(t('ib_export_ok'));
  };

  if (!permissions.list) {
    return (
      <div className="empty-state" style={{ padding: 48 }}>
        <h3>{t('ib_forbidden_title')}</h3>
        <p className="t-mute">{t('bm_forbidden_sub')}</p>
      </div>
    );
  }

  return (
    <>
      <PageHead
        title={t('s_bk_movements')}
        subtitle={t('bm_subtitle')}
        actions={
          <>
            <Button type="button" variant="ghost" onClick={() => { refresh(); setRefreshKey((k) => k + 1); }}>
              <RefreshCw size={14} /> {t('refresh_all')}
            </Button>
            {permissions.export && (
              <Button type="button" variant="ghost" onClick={handleExport}>
                <Download size={14} /> {t('ib_export')}
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
          renderMono: (value) => <span className="mono fs-12">{String(value ?? '')}</span>,
          renderAmount: (_v, row) => (
            <WalletMoneyCell amount={Number(row.amount)} currency={String(row.currency)} lang={lang} />
          ),
          renderStatus: (value) => (
            <PaymentStatusPill status={value as never} label={t(`bm_status_${String(value)}`, String(value))} />
          ),
          renderMethod: (value) => t(`bm_method_${String(value)}`, String(value)),
          renderError: (value) =>
            value ? <span className="mono fs-12 t-err">{String(value)}</span> : <span className="dash">—</span>,
        }}
        locale={i18n.language}
        t={translate}
      />
    </>
  );
}
