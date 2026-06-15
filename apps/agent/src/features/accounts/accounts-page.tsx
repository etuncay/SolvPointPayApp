import { useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { DynamicTable, PageHead, type TableCustomFunctions } from '@epay/ui';
import { AGENT_PATHS } from '@/config/agent-nav-paths';
import {
  buildAccountsActivitiesTableConfig,
  buildAccountsBalancesTableConfig,
} from './accounts-table-config';

/** İşlem durumu → durum sınıfı (DynamicTable `st` pill). */
function statusClass(status: string): string {
  if (status === 'Completed' || status === 'Sent') return 'active';
  if (status === 'Pending' || status === 'OnHold' || status === 'Retrying') return 'pending';
  if (status === 'ErrorComplete' || status === 'Canceled' || status === 'ErrorSend' || status === 'ErrorReceive')
    return 'danger';
  return 'muted';
}

/** Agent Hesaplarım (2) — bakiye + hareketler, config-driven (DynamicTable + @epay/data). */
export function AccountsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });

  const balancesConfig = useMemo(
    () => buildAccountsBalancesTableConfig(translate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language],
  );
  const activitiesConfig = useMemo(
    () => buildAccountsActivitiesTableConfig(translate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language],
  );

  const balanceFns: TableCustomFunctions = useMemo(
    () => ({
      renderAccountType: (val: unknown): ReactNode =>
        val === 'agent_advance' ? t('ag_acc_type_advance') : t('ag_acc_type_commission'),
    }),
    [t],
  );

  const activityFns: TableCustomFunctions = useMemo(
    () => ({
      renderDirection: (val: unknown): ReactNode =>
        val === 'Inflow' ? (
          <span className="badge badge--success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <ArrowDownLeft size={12} /> {t('ag_acc_dir_inflow')}
          </span>
        ) : (
          <span className="badge badge--danger" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <ArrowUpRight size={12} /> {t('ag_acc_dir_outflow')}
          </span>
        ),
      renderTxType: (val: unknown): ReactNode => t(`wa_tx_${String(val)}`, { defaultValue: String(val) }),
      renderStatus: (val: unknown): ReactNode => (
        <span className={`st ${statusClass(String(val))}`}>
          {t(`tx_status_${String(val)}`, { defaultValue: String(val) })}
        </span>
      ),
    }),
    [t],
  );

  return (
    <>
      <PageHead title={t('ag_nav_accounts')} subtitle={t('ag_acc_subtitle')} />

      <div className="fcard" style={{ marginBottom: 16 }}>
        <div className="fcard-body">
          <div className="section-h" style={{ marginBottom: 12 }}>{t('ag_acc_balance_title')}</div>
          <DynamicTable
            config={balancesConfig}
            permissions={{}}
            customFunctions={balanceFns}
            locale={i18n.language}
            t={translate}
          />
        </div>
      </div>

      <DynamicTable
        config={activitiesConfig}
        header={{ title: t('ag_acc_activities_title'), hidePageHead: false }}
        permissions={{ export: true }}
        customFunctions={activityFns}
        locale={i18n.language}
        t={translate}
        onRowClick={(row) => navigate(AGENT_PATHS.transaction.detail(Number(row.transactionId)))}
      />
    </>
  );
}
