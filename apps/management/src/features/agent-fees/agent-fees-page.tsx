import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Pencil } from 'lucide-react';
import { DynamicTable } from '@epay/ui';
import { exportCsv, type CsvColumn } from '@/lib/csv';
import { useRole } from '@/domain/role-context';
import { AgentFeeFormModal } from './components/agent-fee-form-modal';
import { getAgentFeePermissions } from './domain/permissions';
import {
  DEFAULT_AGENT_FEE_FILTERS,
  type AgentFee,
  type AgentFeeFilters,
  type AgentFeeInput,
  type AgentFeeUpdateInput,
  type FeeTransactionType,
} from './domain/types';
import { TRANSACTION_TYPE_OPTIONS } from './domain/types';
import { agentFeesService } from './api';
import { createAgentFeeApprovalRequest } from './api/agent-fee-approval-bridge';
import { useAgentFees } from './hooks/use-agent-fees';
import { buildAgentFeesTableConfig } from './agent-fees-table-config';

function fmtNum(n: number) {
  return n.toLocaleString('tr-TR', { maximumFractionDigits: 2 });
}

export function AgentFeesPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const tr = i18n.language === 'tr';
  const { role } = useRole();
  const permissions = getAgentFeePermissions(role);
  const { hasConflict, version } = useAgentFees();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingFee, setEditingFee] = useState<AgentFee | null>(null);
  const lastFilters = useRef<AgentFeeFilters>(DEFAULT_AGENT_FEE_FILTERS);

  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });

  const tableConfig = useMemo(
    () =>
      buildAgentFeesTableConfig(translate, (f) => {
        lastFilters.current = f;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language, version],
  );

  const txLabel = useMemo(
    () =>
      Object.fromEntries(
        TRANSACTION_TYPE_OPTIONS.map((tx) => [tx, t(`afee_tx_${tx}`, tx)]),
      ) as Record<FeeTransactionType, string>,
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

  const openEdit = (fee: AgentFee) => {
    if (fee.status === 'Passive') return;
    setModalMode('edit');
    setEditingFee(fee);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingFee(null);
  };

  const handleCreate = (input: AgentFeeInput) => {
    const result = createAgentFeeApprovalRequest({ mode: 'new', values: input }, role);
    if (!result.ok) {
      toast.error(t(result.error ?? 'ib_save_failed'));
      return;
    }
    toast.success(t('if_sent_to_approval'));
    closeModal();
    navigate('/approvals');
  };

  const handleUpdate = (id: number, input: AgentFeeUpdateInput) => {
    if (!editingFee) return;
    const oldValues = {
      fixedFee: editingFee.fixedFee,
      variableFeePct: editingFee.variableFeePct,
      startDate: editingFee.startDate,
      endDate: editingFee.endDate,
    };
    const result = createAgentFeeApprovalRequest(
      {
        mode: 'edit',
        feeId: id,
        values: input,
        oldValues,
        identity: {
          groupCode: editingFee.groupCode,
          transactionType: editingFee.transactionType,
          currency: editingFee.currency,
        },
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

  const csvColumns: CsvColumn<AgentFee>[] = useMemo(
    () => [
      { header: t('agg_col_code'), value: (r) => r.groupCode },
      { header: t('rs_scope_transaction'), value: (r) => txLabel[r.transactionType] },
      { header: t('cba_col_currency'), value: (r) => r.currency },
      { header: t('cfe_col_lower_limit'), value: (r) => r.lowerLimit },
      { header: t('cfe_col_fixed'), value: (r) => r.fixedFee },
      { header: t('cfe_col_variable'), value: (r) => r.variableFeePct },
      { header: t('cfe_col_start'), value: (r) => r.startDate ?? '' },
      { header: t('cfe_col_end'), value: (r) => r.endDate ?? '' },
      { header: t('prm_col_changed_by'), value: (r) => r.changedBy },
      { header: t('cfe_col_changed_at'), value: (r) => r.changedAt },
      { header: t('scf_col_status'), value: (r) => r.status },
    ],
    [t, txLabel],
  );

  const handleExport = () => {
    const rows = agentFeesService.list(lastFilters.current);
    exportCsv('temsilci-ucretleri', rows, csvColumns);
    toast.success(t('wl_export_ok'));
  };

  const customFunctions = useMemo(
    () => ({
      renderTransactionType: (_v: unknown, row: Record<string, unknown>) => {
        const fee = row as AgentFee;
        return <span className="fs-12">{txLabel[fee.transactionType]}</span>;
      },
      renderMoney: (v: unknown) => (
        <span className="mono fs-12">{fmtNum(Number(v ?? 0))}</span>
      ),
      renderVariablePct: (_v: unknown, row: Record<string, unknown>) => (
        <span className="mono fs-12">%{fmtNum((row as AgentFee).variableFeePct)}</span>
      ),
      renderOptionalDate: (v: unknown) => (
        <span className="mono fs-12">{v ? String(v) : '—'}</span>
      ),
      renderChangedAt: (_v: unknown, row: Record<string, unknown>) => (
        <span className="mono fs-12">{fmtDate(String((row as AgentFee).changedAt))}</span>
      ),
      renderStatus: (_v: unknown, row: Record<string, unknown>) => {
        const fee = row as AgentFee;
        return (
          <span className={fee.status === 'Active' ? 'st active' : 'st inactive'}>
            {t(`afee_status_${fee.status}`, fee.status)}
          </span>
        );
      },
      renderActions: (_v: unknown, row: Record<string, unknown>) => {
        const fee = row as AgentFee;
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
    [t, txLabel, permissions.update, tr],
  );

  return (
    <>
      <DynamicTable
        config={tableConfig}
        header={{
          title: t('s_cust_fees'),
          subtitle: t('afee_subtitle'),
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
        {t('afee_hint')}
      </p>

      <AgentFeeFormModal
        open={modalOpen}
        mode={modalMode}
        fee={editingFee}
        hasConflict={hasConflict}
        onClose={closeModal}
        onSaveCreate={handleCreate}
        onSaveUpdate={handleUpdate}
      />
    </>
  );
}
