import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Pencil } from 'lucide-react';
import { DynamicTable } from '@epay/ui';
import { exportCsv, type CsvColumn } from '@/lib/csv';
import { useRole } from '@/domain/role-context';
import { CustomerFeeFormModal } from './components/customer-fee-form-modal';
import { getCustomerFeePermissions } from './domain/permissions';
import {
  COUNTRY_OPTIONS,
  DEFAULT_FEE_FILTERS,
  TRANSACTION_TYPE_OPTIONS,
  type CustomerFee,
  type CustomerFeeFilters,
  type CustomerFeeInput,
  type FeeCountry,
  type FeeTransactionType,
} from './domain/types';
import { customerFeesService } from './api';
import { createCustomerFeeApprovalRequest } from './api/customer-fee-approval-bridge';
import { useCustomerFees } from './hooks/use-customer-fees';
import { buildCustomerFeesTableConfig } from './customer-fees-table-config';

function fmtNum(n: number) {
  return n.toLocaleString('tr-TR', { maximumFractionDigits: 2 });
}

function feeToInput(fee: CustomerFee): CustomerFeeInput {
  return {
    transactionType: fee.transactionType,
    currency: fee.currency,
    lowerLimit: fee.lowerLimit,
    fixedFee: fee.fixedFee,
    variableFeePct: fee.variableFeePct,
    startDate: fee.startDate,
    endDate: fee.endDate,
    sourceCountry: fee.sourceCountry,
    targetCountry: fee.targetCountry,
  };
}

export function CustomerFeesPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const tr = i18n.language === 'tr';
  const { role } = useRole();
  const permissions = getCustomerFeePermissions(role);
  const { version } = useCustomerFees();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingFee, setEditingFee] = useState<CustomerFee | null>(null);
  const lastFilters = useRef<CustomerFeeFilters>(DEFAULT_FEE_FILTERS);

  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });

  const tableConfig = useMemo(
    () =>
      buildCustomerFeesTableConfig(translate, (f) => {
        lastFilters.current = f;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language, version],
  );

  const txLabel = useMemo(
    () =>
      Object.fromEntries(
        TRANSACTION_TYPE_OPTIONS.map((tx) => [tx, t(`cfe_tx_${tx}`, tx)]),
      ) as Record<FeeTransactionType, string>,
    [t],
  );

  const countryLabel = useMemo(
    () =>
      Object.fromEntries(
        COUNTRY_OPTIONS.map((c) => [c, t(`cfe_country_${c}`, c)]),
      ) as Record<FeeCountry, string>,
    [t],
  );

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString(tr ? 'tr-TR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

  const openCreate = () => {
    setModalMode('create');
    setEditingFee(null);
    setModalOpen(true);
  };

  const openEdit = (fee: CustomerFee) => {
    if (fee.status === 'Passive') return;
    setModalMode('edit');
    setEditingFee(fee);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingFee(null);
  };

  const handleSave = (input: CustomerFeeInput, id?: number) => {
    const result = createCustomerFeeApprovalRequest(
      {
        mode: id == null ? 'new' : 'edit',
        feeId: id ?? null,
        values: input,
        oldValues: id != null && editingFee ? feeToInput(editingFee) : null,
      },
      role,
    );
    if (!result.ok) {
      toast.error(t(result.error ?? 'ib_save_failed'));
      return;
    }
    toast.success(t('if_sent_to_approval'));
    closeModal();
    navigate('/approvals');
  };

  const csvColumns: CsvColumn<CustomerFee>[] = useMemo(
    () => [
      { header: t('rs_scope_transaction'), value: (r) => txLabel[r.transactionType] },
      { header: t('cba_col_currency'), value: (r) => r.currency },
      { header: t('cfe_col_lower_limit'), value: (r) => r.lowerLimit },
      { header: t('cfe_col_fixed'), value: (r) => r.fixedFee },
      { header: t('cfe_col_variable'), value: (r) => r.variableFeePct },
      { header: t('cfe_col_start'), value: (r) => r.startDate ?? '' },
      { header: t('cfe_col_end'), value: (r) => r.endDate ?? '' },
      { header: t('cfe_col_source'), value: (r) => countryLabel[r.sourceCountry] },
      { header: t('cfe_col_target'), value: (r) => countryLabel[r.targetCountry] },
      { header: t('prm_col_changed_by'), value: (r) => r.changedBy },
      { header: t('cfe_col_changed_at'), value: (r) => r.changedAt },
      { header: t('scf_col_status'), value: (r) => r.status },
    ],
    [t, txLabel, countryLabel],
  );

  const handleExport = () => {
    const rows = customerFeesService.list(lastFilters.current);
    exportCsv('musteri-ucretleri', rows, csvColumns);
    toast.success(t('wl_export_ok'));
  };

  const customFunctions = useMemo(
    () => ({
      renderTransactionType: (_v: unknown, row: Record<string, unknown>) => {
        const fee = row as CustomerFee;
        return <span className="fs-12">{txLabel[fee.transactionType]}</span>;
      },
      renderMoney: (v: unknown) => (
        <span className="mono fs-12">{fmtNum(Number(v ?? 0))}</span>
      ),
      renderVariablePct: (_v: unknown, row: Record<string, unknown>) => (
        <span className="mono fs-12">%{fmtNum((row as CustomerFee).variableFeePct)}</span>
      ),
      renderOptionalDate: (v: unknown) => (
        <span className="mono fs-12">{v ? String(v) : '—'}</span>
      ),
      renderSourceCountry: (_v: unknown, row: Record<string, unknown>) => (
        <span className="fs-12">{countryLabel[(row as CustomerFee).sourceCountry]}</span>
      ),
      renderTargetCountry: (_v: unknown, row: Record<string, unknown>) => (
        <span className="fs-12">{countryLabel[(row as CustomerFee).targetCountry]}</span>
      ),
      renderChangedAt: (_v: unknown, row: Record<string, unknown>) => (
        <span className="mono fs-12">{fmtDate(String((row as CustomerFee).changedAt))}</span>
      ),
      renderStatus: (_v: unknown, row: Record<string, unknown>) => {
        const fee = row as CustomerFee;
        return (
          <span className={fee.status === 'Active' ? 'st active' : 'st inactive'}>
            {t(`cfe_status_${fee.status}`, fee.status)}
          </span>
        );
      },
      renderActions: (_v: unknown, row: Record<string, unknown>) => {
        const fee = row as CustomerFee;
        if (!permissions.update || fee.status !== 'Active') return null;
        return (
          <div className="row-actions">
            <button type="button" title={t('ib_edit')} onClick={() => openEdit(fee)}>
              <Pencil size={14} />
            </button>
          </div>
        );
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, txLabel, countryLabel, permissions.update, tr],
  );

  return (
    <>
      <DynamicTable
        config={tableConfig}
        header={{
          title: t('s_cust_fees'),
          subtitle: t('cfe_subtitle'),
        }}
        permissions={{
          new: permissions.insert,
          edit: false,
          delete: false,
          view: false,
          export: permissions.export,
        }}
        customFunctions={customFunctions}
        locale={i18n.language}
        t={translate}
        onNew={permissions.insert ? openCreate : undefined}
        onExport={permissions.export ? handleExport : undefined}
      />

      <p className="fs-11 t-mute" style={{ marginTop: 10 }}>
        {t('cfe_hint')}
      </p>

      <CustomerFeeFormModal
        open={modalOpen}
        mode={modalMode}
        fee={editingFee}
        onClose={closeModal}
        onSave={handleSave}
      />
    </>
  );
}
