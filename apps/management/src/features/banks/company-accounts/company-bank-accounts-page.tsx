import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Ban, Download, Loader2, Pencil, RefreshCw } from 'lucide-react';
import { DynamicTable } from '@epay/ui';
import type { TranslateFn } from '@epay/ui';
import { useRole } from '@/domain/role-context';
import { exportCsv, type CsvColumn } from '@/lib/csv';
import { companyBankAccountsService } from './api';
import { getCompanyBankAccountPermissions } from './domain/permissions';
import type { BankAccountType, CompanyBankAccount, CompanyBankAccountFilters, CompanyBankAccountInput } from './domain/types';
import { DEFAULT_COMPANY_BANK_ACCOUNT_FILTERS, BANK_ACCOUNT_TYPE_OPTIONS } from './domain/types';
import { useCompanyBankAccounts } from './hooks/use-company-bank-accounts';
import { buildCompanyBankAccountsTableConfig } from './company-bank-accounts-table-config';
import { CompanyBankAccountFormModal } from './components/company-bank-account-form-modal';

function fmtMoney(amount: number, currency: string, tr: boolean) {
  return new Intl.NumberFormat(tr ? 'tr-TR' : 'en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function fmtDate(ts: string, tr: boolean) {
  return new Date(ts.replace(' ', 'T')).toLocaleString(tr ? 'tr-TR' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function CompanyBankAccountsPage() {
  const { t, i18n } = useTranslation();
  const tr = i18n.language === 'tr';
  const { role } = useRole();
  const permissions = getCompanyBankAccountPermissions(role);

  const { bankOptions } = useCompanyBankAccounts();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedAccount, setSelectedAccount] = useState<CompanyBankAccount | null>(null);
  const [tableVersion, setTableVersion] = useState(0);
  const [balanceLoadingId, setBalanceLoadingId] = useState<number | null>(null);

  const lastFilters = useRef<CompanyBankAccountFilters>(DEFAULT_COMPANY_BANK_ACCOUNT_FILTERS);

  const translate: TranslateFn = (key, fb) => t(key, { defaultValue: fb ?? key });

  const tableConfig = useMemo(
    () =>
      buildCompanyBankAccountsTableConfig(translate, (f) => {
        lastFilters.current = f;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language, tableVersion],
  );

  const typeLabel = useMemo(
    () =>
      Object.fromEntries(
        BANK_ACCOUNT_TYPE_OPTIONS.map((tp) => [tp, t(`cba_type_${tp}`)]),
      ) as Record<BankAccountType, string>,
    [t],
  );

  const closeModal = () => {
    setModalOpen(false);
    setSelectedAccount(null);
  };

  const openCreate = () => {
    if (!permissions.insert) return;
    setModalMode('create');
    setSelectedAccount(null);
    setModalOpen(true);
  };

  const openEdit = (a: CompanyBankAccount) => {
    if (!permissions.update) return;
    if (a.status !== 'Active') return;
    setModalMode('edit');
    setSelectedAccount(a);
    setModalOpen(true);
  };

  const handleSaveCreate = (input: CompanyBankAccountInput) => {
    const result = companyBankAccountsService.create(input);
    if (!result.ok) {
      toast.error(t(result.error ?? 'ib_save_failed'));
      return false;
    }
    toast.success(t('cba_created'));
    setTableVersion((v) => v + 1);
    return true;
  };

  const handleSaveUpdate = (id: number, input: CompanyBankAccountInput) => {
    const result = companyBankAccountsService.update(id, input);
    if (!result.ok) {
      toast.error(t(result.error ?? 'ib_save_failed'));
      return false;
    }
    toast.success(t('cba_updated'));
    setTableVersion((v) => v + 1);
    return true;
  };

  const handleDeactivate = (a: CompanyBankAccount) => {
    if (!permissions.deactivate) return;
    if (!window.confirm(t('cba_deactivate_confirm', { iban: a.iban }))) return;
    const result = companyBankAccountsService.deactivate(a.id);
    if (!result.ok) {
      toast.error(t(result.error ?? 'ib_deactivate_failed'));
      return;
    }
    toast.success(t('cba_deactivated'));
    setTableVersion((v) => v + 1);
    if (selectedAccount?.id === a.id) closeModal();
  };

  const handleFetchBalance = async (a: CompanyBankAccount) => {
    if (!permissions.fetchBalance) return;
    setBalanceLoadingId(a.id);
    const result = companyBankAccountsService.fetchBalance(a.id);
    setBalanceLoadingId(null);
    if (!result.ok) {
      toast.error(t(result.error ?? 'cba_balance_failed'));
      return;
    }
    toast.success(t('cba_balance_updated'));
    setTableVersion((v) => v + 1);
  };

  const csvColumns: CsvColumn<CompanyBankAccount>[] = useMemo(
    () => [
      { header: t('rpt_col_bank'), value: (r) => r.bankName },
      { header: t('cba_col_type'), value: (r) => typeLabel[r.accountType] },
      { header: t('cba_col_iban'), value: (r) => r.iban },
      { header: t('cba_col_currency'), value: (r) => r.currency },
      { header: t('cba_col_balance'), value: (r) => String(r.balance) },
      { header: t('cba_col_branch'), value: (r) => r.branchCode },
      { header: t('cba_col_account'), value: (r) => r.accountNo },
      { header: t('cba_col_suffix'), value: (r) => r.suffix ?? '' },
      { header: t('cba_col_updated'), value: (r) => r.lastUpdatedAt },
      { header: t('rpt_col_status'), value: (r) => r.status },
    ],
    [t, typeLabel],
  );

  const handleExport = () => {
    const rows = companyBankAccountsService.list(lastFilters.current);
    exportCsv('firma-banka-hesaplari', rows, csvColumns);
    toast.success(t('ib_export_ok'));
  };

  if (!permissions.list) {
    return (
      <div className="empty-state" style={{ padding: 48 }}>
        <h3>{t('ib_forbidden_title')}</h3>
        <p className="t-mute">{t('cba_forbidden_sub')}</p>
      </div>
    );
  }

  const customFunctions = {
    renderAccountType: (_v: unknown, row: Record<string, unknown>) => {
      const a = row as CompanyBankAccount;
      return (
        <span className="fs-12">
          {typeLabel[a.accountType]}
          {a.accountType === 'Protection' && (
            <span className="fs-11 t-mute" style={{ display: 'block' }} title={t('cba_type_protection_hint')}>
              {t('cba_type_Protection')}
            </span>
          )}
        </span>
      );
    },
    renderBalance: (_v: unknown, row: Record<string, unknown>) => {
      const a = row as CompanyBankAccount;
      return <span className="mono fs-12">{fmtMoney(a.balance, a.currency, tr)}</span>;
    },
    renderSuffix: (v: unknown) => <span className="mono fs-12">{v ? String(v) : '—'}</span>,
    renderUpdatedAt: (v: unknown) => <span className="mono fs-12">{fmtDate(String(v ?? ''), tr)}</span>,
    renderStatus: (_v: unknown, row: Record<string, unknown>) => {
      const a = row as CompanyBankAccount;
      return (
        <span className={a.status === 'Active' ? 'st active' : 'st inactive'}>
          {t(`cba_status_${a.status}`, a.status)}
        </span>
      );
    },
    renderActions: (_v: unknown, row: Record<string, unknown>) => {
      const a = row as CompanyBankAccount;
      const loading = balanceLoadingId === a.id;
      return (
        <div className="row-actions">
          {permissions.update && a.status === 'Active' && (
            <button type="button" title={t('ib_edit')} onClick={() => openEdit(a)}>
              <Pencil size={14} />
            </button>
          )}
          {permissions.fetchBalance && a.status === 'Active' && (
            <button
              type="button"
              title={t('cba_refresh_balance')}
              disabled={loading}
              onClick={() => void handleFetchBalance(a)}
            >
              {loading ? <Loader2 size={14} /> : <RefreshCw size={14} />}
            </button>
          )}
          {permissions.deactivate && a.status === 'Active' && (
            <button type="button" title={t('ib_deactivate')} onClick={() => handleDeactivate(a)}>
              <Ban size={14} />
            </button>
          )}
        </div>
      );
    },
  };

  return (
    <>
      {bankOptions.length === 0 && (
        <div
          className="banner banner-warn"
          style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 8, fontSize: 13 }}
        >
          {t('cba_no_active_banks')}
        </div>
      )}

      <DynamicTable
        config={tableConfig}
        header={{
          title: t('s_bk_accounts'),
          subtitle: t('cba_subtitle'),
          status: (
            <span className="fs-12 t-mute">
              {t('cba_active_count', {
                count: companyBankAccountsService.list({ ...DEFAULT_COMPANY_BANK_ACCOUNT_FILTERS, status: 'Active' }).length,
              })}
            </span>
          ),
        }}
        permissions={{
          new: permissions.insert && bankOptions.length > 0,
          edit: false,
          delete: false,
          view: true,
          export: permissions.export,
        }}
        customFunctions={customFunctions}
        locale={i18n.language}
        t={translate}
        onNew={permissions.insert && bankOptions.length > 0 ? openCreate : undefined}
        onExport={permissions.export ? () => handleExport() : undefined}
      />

      <CompanyBankAccountFormModal
        open={modalOpen}
        mode={modalMode}
        account={modalMode === 'edit' ? selectedAccount : null}
        bankOptions={bankOptions}
        onClose={closeModal}
        onSaveCreate={handleSaveCreate}
        onSaveUpdate={handleSaveUpdate}
      />
    </>
  );
}

