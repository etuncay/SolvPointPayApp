import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import {
  Badge,
  Button,
  DynamicTable,
  WalletMoneyCell,
} from '@epay/ui';
import { fmtNumber } from '@/lib/format';
import { exportCsv, type CsvColumn } from '@/lib/csv';
import type { WalletActivity, TransactionStatus } from './domain/activity-types';
import { DEFAULT_WALLET_ACTIVITY_FILTERS, type WalletActivityFilters } from './domain/activity-types';
import { useWalletActivities } from './hooks/use-wallet-activities';
import { useRole } from '@/domain/role-context';
import { buildWalletActivitiesTableConfig } from './wallet-activities-table-config';

function directionTone(direction: WalletActivity['direction']) {
  return direction === 'Inflow' ? 'ok' : 'danger';
}

function statusTone(status: TransactionStatus) {
  if (status === 'Completed') return 'ok';
  if (status === 'Pending' || status === 'OnHold') return 'warn';
  if (status === 'ErrorComplete' || status === 'Canceled') return 'danger';
  return 'info';
}

export function WalletActivitiesPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const navigate = useNavigate();
  const { role } = useRole();
  const {
    walletId,
    wallet,
    permissions,
    forbidden,
    notFound,
    exportRows,
    refresh,
  } = useWalletActivities();

  const [version, setVersion] = useState(0);
  const lastFilters = useRef<WalletActivityFilters>(DEFAULT_WALLET_ACTIVITY_FILTERS);

  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });

  const tableConfig = useMemo(
    () =>
      buildWalletActivitiesTableConfig(walletId, role, translate, (f) => {
        lastFilters.current = f;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [walletId, role, i18n.language, version],
  );

  const customFunctions = useMemo(
    () => ({
      renderMono: (value: unknown) => <span className="mono fs-12">{String(value ?? '')}</span>,
      renderSoftMono: (value: unknown) => <span className="mono fs-12 t-soft">{String(value ?? '')}</span>,
      renderMonoOrDash: (value: unknown) => <span className="mono fs-12">{String(value ?? '—')}</span>,
      renderDirection: (value: unknown) => (
        <Badge tone={directionTone(value as WalletActivity['direction'])}>
          {t(`wa_dir_${String(value)}`, String(value))}
        </Badge>
      ),
      renderType: (value: unknown) => t(`wa_tx_${String(value)}`, String(value)),
      renderAmount: (value: unknown, row: Record<string, unknown>) => (
        <WalletMoneyCell
          amount={Number(value ?? 0)}
          currency={String((row as WalletActivity).currency)}
          lang={lang}
        />
      ),
      renderPostBalance: (value: unknown, row: Record<string, unknown>) => (
        <WalletMoneyCell
          amount={Number(value ?? 0)}
          currency={String((row as WalletActivity).currency)}
          lang={lang}
        />
      ),
      renderStatus: (value: unknown) => (
        <Badge tone={statusTone(value as TransactionStatus)}>
          {t(`wa_status_${String(value)}`, String(value))}
        </Badge>
      ),
    }),
    [t, lang],
  );

  const handleExport = () => {
    if (!permissions.export) return;
    const result = exportRows();
    if (!result.ok) {
      toast.error(t(result.error));
      return;
    }
    const csvColumns: CsvColumn<WalletActivity>[] = [
      { header: t('wa_col_tx_no'), value: (r) => r.transactionNo },
      { header: t('ap_col_date'), value: (r) => r.createdAt },
      { header: t('wa_col_direction'), value: (r) => r.direction },
      { header: t('wa_col_cp_no'), value: (r) => String(r.counterpartyNo ?? '') },
      { header: t('wa_col_cp_name'), value: (r) => r.counterpartyName },
      { header: t('wa_col_cp_account'), value: (r) => r.counterpartyAccount },
      { header: t('wa_col_reference'), value: (r) => r.referenceNo },
      { header: t('wa_col_type'), value: (r) => r.transactionType },
      { header: t('cba_col_currency'), value: (r) => r.currency },
      { header: t('rpt_col_amount'), value: (r) => r.amount },
      { header: t('wa_col_post_balance'), value: (r) => r.postBalance },
      { header: t('rpt_col_status'), value: (r) => r.status },
    ];
    exportCsv(`wallet-${walletId}-activities`, result.rows, csvColumns);
    toast.success(t('wa_export_ok'));
  };

  const handleRefresh = () => {
    refresh();
    setVersion((v) => v + 1);
  };

  if (notFound || !wallet) {
    return (
      <div className="empty-state" style={{ padding: 48 }}>
        <h3>{t('wd_not_found_title')}</h3>
        <p className="t-mute">{t('wa_not_found_sub')}</p>
        <Button type="button" onClick={() => navigate('/wallets')} style={{ marginTop: 16 }}>
          {t('wd_back_list')}
        </Button>
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="empty-state" style={{ padding: 48 }}>
        <h3>{t('wa_forbidden_title')}</h3>
        <p className="t-mute">{t('wa_forbidden_sub')}</p>
        <Button type="button" onClick={() => navigate('/wallets')} style={{ marginTop: 16 }}>
          {t('wd_back_list')}
        </Button>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <Button type="button" variant="ghost" asChild>
          <Link to={`/wallets/${walletId}`}>
            <ArrowLeft size={14} /> {t('wa_back_detail')}
          </Link>
        </Button>
      </div>

      <div
        className="form-card"
        style={{ marginBottom: 16, padding: '12px 16px', display: 'flex', gap: 24, flexWrap: 'wrap' }}
      >
        <div>
          <div className="t-mute fs-11">{t('cba_col_account')}</div>
          <div className="mono fs-13">{wallet.walletNo}</div>
        </div>
        <div>
          <div className="t-mute fs-11">{t('wl_c_name')}</div>
          <div>{wallet.ownerName}</div>
        </div>
        <div>
          <div className="t-mute fs-11">{t('wl_c_ccy')}</div>
          <div className="mono fs-13">{wallet.ccy}</div>
        </div>
        <div>
          <div className="t-mute fs-11">{t('wl_c_available')}</div>
          <WalletMoneyCell amount={wallet.available} currency={wallet.ccy} lang={lang} />
        </div>
      </div>

      <DynamicTable
        config={tableConfig}
        header={{
          title: t('wd_activities'),
          subtitle: t('wa_subtitle', { walletNo: wallet.walletNo }),
          trailing: (
            <>
              {permissions.export && (
                <Button type="button" variant="ghost" onClick={handleExport}>
                  {t('cust_export')}
                </Button>
              )}
              <Button type="button" variant="ghost" onClick={handleRefresh}>
                <RefreshCw size={13} /> {t('refresh_all')}
              </Button>
            </>
          ),
        }}
        permissions={{ new: false, edit: false, delete: false, view: true, export: false }}
        customFunctions={customFunctions}
        locale={i18n.language}
        t={translate}
        onRowClick={(row) => navigate(`/transfers/${row.transactionId}`)}
      />
    </>
  );
}
