import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Ban, Pencil, Users } from 'lucide-react';
import { DynamicTable } from '@epay/ui';
import { exportCsv, type CsvColumn } from '@/lib/csv';
import { useRole } from '@/domain/role-context';
import { AgentGroupFormModal } from './components/agent-group-form-modal';
import { getAgentGroupPermissions } from './domain/permissions';
import type {
  AgentGroupFilters,
  AgentGroupInput,
  AgentGroupListRow,
  AgentGroupUpdateInput,
} from './domain/types';
import { DEFAULT_AGENT_GROUP_FILTERS } from './domain/types';
import { agentGroupsService } from './api';
import { useAgentGroups } from './hooks/use-agent-groups';
import { buildAgentGroupsTableConfig } from './agent-groups-table-config';

function fmtMetric(v: number | null, suffix = ''): string {
  if (v == null) return '—';
  return suffix ? `${v.toFixed(2)} ${suffix}` : String(v);
}

export function AgentGroupsPage() {
  const { t, i18n } = useTranslation();
  const { role } = useRole();
  const permissions = getAgentGroupPermissions(role);
  const { create, update, deactivate, version } = useAgentGroups();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingGroup, setEditingGroup] = useState<AgentGroupListRow | null>(null);
  const lastFilters = useRef<AgentGroupFilters>(DEFAULT_AGENT_GROUP_FILTERS);

  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });

  const tableConfig = useMemo(
    () =>
      buildAgentGroupsTableConfig(translate, (f) => {
        lastFilters.current = f;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language, version],
  );

  const openCreate = () => {
    setModalMode('create');
    setEditingGroup(null);
    setModalOpen(true);
  };

  const openEdit = (g: AgentGroupListRow) => {
    if (g.status === 'Passive') return;
    setModalMode('edit');
    setEditingGroup(g);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingGroup(null);
  };

  const handleCreate = (input: AgentGroupInput) => {
    const result = create(input);
    if (!result.ok) {
      toast.error(t(result.error ?? 'ib_save_failed'));
      return;
    }
    toast.success(t('agg_created'));
    closeModal();
  };

  const handleUpdate = (id: number, input: AgentGroupUpdateInput) => {
    const result = update(id, input);
    if (!result.ok) {
      toast.error(t(result.error ?? 'ib_save_failed'));
      return;
    }
    toast.success(t('agg_updated'));
    closeModal();
  };

  const handleDeactivate = (g: AgentGroupListRow) => {
    if (!window.confirm(t('agg_deactivate_confirm', { name: g.name }))) return;
    const result = deactivate(g.id);
    if (!result.ok) {
      toast.error(t(result.error ?? 'agg_deactivate_failed'));
      return;
    }
    toast.success(t('agg_deactivated'));
  };

  const csvColumns: CsvColumn<AgentGroupListRow>[] = useMemo(
    () => [
      { header: t('agg_col_code'), value: (r) => r.groupCode },
      { header: t('agg_col_name'), value: (r) => r.name },
      { header: t('rpt_col_desc'), value: (r) => r.description },
      { header: t('agg_col_agent_count'), value: (r) => String(r.agentCount) },
      { header: t('agg_col_avg_fee'), value: (r) => fmtMetric(r.avgFeePerTx, 'TL') },
      { header: t('agg_col_avg_tx'), value: (r) => fmtMetric(r.avgTxCountPerAgent) },
      { header: t('scf_col_status'), value: (r) => r.status },
    ],
    [t],
  );

  const handleExport = () => {
    const rows = agentGroupsService.list(lastFilters.current);
    exportCsv('temsilci-gruplari', rows, csvColumns);
    toast.success(t('wl_export_ok'));
  };

  const showActions = permissions.update || permissions.deactivate;

  const customFunctions = useMemo(
    () => ({
      renderDescription: (_v: unknown, row: Record<string, unknown>) => {
        const g = row as AgentGroupListRow;
        return <span className="fs-12 t-mute">{g.description || '—'}</span>;
      },
      renderAvgFee: (_v: unknown, row: Record<string, unknown>) => (
        <span className="mono fs-12">{fmtMetric((row as AgentGroupListRow).avgFeePerTx, 'TL')}</span>
      ),
      renderAvgTx: (_v: unknown, row: Record<string, unknown>) => (
        <span className="mono fs-12">{fmtMetric((row as AgentGroupListRow).avgTxCountPerAgent)}</span>
      ),
      renderStatus: (_v: unknown, row: Record<string, unknown>) => {
        const g = row as AgentGroupListRow;
        return (
          <span className={g.status === 'Active' ? 'st active' : 'st inactive'}>
            {t(`agg_status_${g.status}`, g.status)}
          </span>
        );
      },
      renderActions: (_v: unknown, row: Record<string, unknown>) => {
        const g = row as AgentGroupListRow;
        if (!showActions) return null;
        return (
          <div className="row-actions">
            {permissions.update && g.status === 'Active' && (
              <button type="button" title={t('ib_edit')} onClick={() => openEdit(g)}>
                <Pencil size={14} />
              </button>
            )}
            {permissions.deactivate && g.status === 'Active' && (
              <button type="button" title={t('ib_deactivate')} onClick={() => handleDeactivate(g)}>
                <Ban size={14} />
              </button>
            )}
            <Link
              to={`/agents/groups/${g.groupCode}/agents`}
              className="row-action-link"
              title={t('nav_agents')}
            >
              <Users size={14} />
            </Link>
          </div>
        );
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, showActions, permissions.update, permissions.deactivate],
  );

  return (
    <>
      <DynamicTable
        config={tableConfig}
        header={{
          title: t('s_ag_group'),
          subtitle: t('agg_subtitle'),
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
        {t('agg_hint')}
      </p>

      <AgentGroupFormModal
        open={modalOpen}
        mode={modalMode}
        group={editingGroup}
        onClose={closeModal}
        onSaveCreate={handleCreate}
        onSaveUpdate={handleUpdate}
      />
    </>
  );
}
