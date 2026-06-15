import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Download, Pencil, Plus } from 'lucide-react';
import { DynamicTable } from '@epay/ui';
import type { TranslateFn } from '@epay/ui';
import { Navigate } from 'react-router-dom';
import { useRole } from '@/domain/role-context';
import { exportCsv, type CsvColumn } from '@/lib/csv';
import {
  CURRENCY_OPTIONS,
  DEFAULT_CAMPAIGN_FILTERS,
  TRANSACTION_TYPE_OPTIONS,
  type Campaign,
  type CampaignFilters,
  type CampaignInput,
  type CampaignUpdateInput,
} from './domain/types';
import { customerCampaignsService } from './api';
import { getCampaignPermissions } from './domain/permissions';
import { useCustomerCampaigns } from './hooks/use-customer-campaigns';
import { DateCell, TruncateCell } from './components/campaign-table-cells';
import { CampaignFormModal } from './components/campaign-form-modal';
import { buildCustomerCampaignsTableConfig } from './customer-campaigns-table-config';
import type { FeeCurrency, FeeTransactionType } from '../customer-fees/domain/types';
import './customer-campaigns.css';

function fmtPct(n: number) {
  return `${(n * 100).toFixed(0)}%`;
}

export function CustomerCampaignsPage() {
  const { t, i18n } = useTranslation();
  const { role } = useRole();
  const permissions = getCampaignPermissions(role);
  const { create, update } = useCustomerCampaigns();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [tableVersion, setTableVersion] = useState(0);

  const lastFilters = useRef<CampaignFilters>(DEFAULT_CAMPAIGN_FILTERS);

  const translate: TranslateFn = (key, fb) => t(key, { defaultValue: fb ?? key });

  const txLabel = useMemo(
    () =>
      Object.fromEntries(
        TRANSACTION_TYPE_OPTIONS.map((tx) => [tx, t(`ccm_tx_${tx}`, tx)]),
      ) as Record<FeeTransactionType, string>,
    [t],
  );

  const tableConfig = useMemo(
    () =>
      buildCustomerCampaignsTableConfig(translate, (f) => {
        lastFilters.current = f;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language, tableVersion],
  );

  const csvColumns: CsvColumn<Campaign>[] = useMemo(
    () => [
      { header: t('ccm_col_code'), value: (r) => r.campaignCode },
      { header: t('ccm_col_name'), value: (r) => r.name },
      { header: t('ccm_col_fixed_gain'), value: (r) => fmtPct(r.fixedFeeGainRate) },
      { header: t('ccm_col_comm_gain'), value: (r) => fmtPct(r.commissionGainRate) },
      { header: t('rs_scope_transaction'), value: (r) => txLabel[r.transactionType] },
      { header: t('cba_col_currency'), value: (r) => r.currency },
      { header: t('scf_col_status'), value: (r) => r.status },
    ],
    [t, txLabel],
  );

  if (!permissions.list) {
    return <Navigate to="/" replace />;
  }

  const handleExport = () => {
    const rows = customerCampaignsService.list(lastFilters.current);
    exportCsv('musteri-kampanyalari', rows, csvColumns);
    toast.success(t('wl_export_ok'));
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedCampaign(null);
  };

  const openCreate = () => {
    if (!permissions.insert) return;
    setModalMode('create');
    setSelectedCampaign(null);
    setModalOpen(true);
  };

  const openEdit = (c: Campaign) => {
    if (!permissions.update) return;
    if (c.status !== 'Active') return;
    setModalMode('edit');
    setSelectedCampaign(c);
    setModalOpen(true);
  };

  const handleSaveCreate = (input: CampaignInput) => {
    const result = create(input);
    if (!result.ok) {
      toast.error(t(result.error ?? 'ib_save_failed'));
      return false;
    }
    toast.success(t('ccm_created'));
    setTableVersion((v) => v + 1);
    return true;
  };

  const handleSaveUpdate = (id: number, input: CampaignUpdateInput) => {
    const result = update(id, input);
    if (!result.ok) {
      toast.error(t(result.error ?? 'ib_save_failed'));
      return false;
    }
    toast.success(t('ccm_updated'));
    setTableVersion((v) => v + 1);
    return true;
  };

  const customFunctions = {
    renderCode: (v: unknown) => (
      <TruncateCell value={v == null ? '' : String(v)} className="mono fs-12" />
    ),
    renderName: (v: unknown) => <TruncateCell value={v == null ? '' : String(v)} className="fs-12" />,
    renderDescription: (v: unknown) => (
      <TruncateCell value={v == null ? '' : String(v)} className="fs-12 t-mute" />
    ),
    renderPct: (v: unknown) => (
      <span className="mono fs-12">{v == null ? '—' : fmtPct(Number(v))}</span>
    ),
    renderTransactionType: (v: unknown) => (
      <TruncateCell value={v == null ? '' : txLabel[v as FeeTransactionType]} className="fs-12" />
    ),
    renderStartDate: (v: unknown) => <DateCell value={v as string | null} />,
    renderEndDate: (v: unknown) => <DateCell value={v as string | null} />,
    renderNullableNumber: (v: unknown) => (
      <span className="mono fs-12">{v == null ? '—' : String(v)}</span>
    ),
    renderChangedBy: (v: unknown) => (
      <TruncateCell value={v == null ? '' : String(v)} className="fs-12 t-mute" />
    ),
    renderStatus: (_v: unknown, row: Record<string, unknown>) => {
      const c = row as Campaign;
      return (
        <span className={c.status === 'Active' ? 'st active' : 'st inactive'}>
          {t(`ccm_status_${c.status}`, c.status)}
        </span>
      );
    },
    renderActions: (_v: unknown, row: Record<string, unknown>) => {
      const c = row as Campaign;
      if (!permissions.update || c.status !== 'Active') return null;
      return (
        <div className="row-actions">
          <button type="button" title={t('ib_edit')} onClick={() => openEdit(c)}>
            <Pencil size={14} />
          </button>
        </div>
      );
    },
  };

  const csvExportHiddenButton = permissions.export ? (
    <span style={{ display: 'none' }} />
  ) : null;

  return (
    <>
      <DynamicTable
        config={tableConfig}
        header={{ title: t('s_cust_campaign'), subtitle: t('ccm_subtitle') }}
        permissions={{
          new: permissions.insert,
          edit: false,
          delete: false,
          view: true,
          export: permissions.export,
        }}
        customFunctions={customFunctions}
        locale={i18n.language}
        t={translate}
        onNew={permissions.insert ? openCreate : undefined}
        onExport={permissions.export ? () => handleExport() : undefined}
      />

      {csvExportHiddenButton}

      <CampaignFormModal
        open={modalOpen}
        mode={modalMode}
        campaign={modalMode === 'edit' ? selectedCampaign : null}
        onClose={closeModal}
        onSaveCreate={handleSaveCreate}
        onSaveUpdate={handleSaveUpdate}
      />
    </>
  );
}

