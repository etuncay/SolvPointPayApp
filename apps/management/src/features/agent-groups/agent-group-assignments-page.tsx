import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ArrowLeft, UserMinus } from 'lucide-react';
import { Button, DynamicTable, PageHead } from '@epay/ui';
import { exportCsv, type CsvColumn } from '@/lib/csv';
import { useRole } from '@/domain/role-context';
import { AssignAgentModal } from './components/assign-agent-modal';
import { getAssignmentPermissions } from './domain/assignment-permissions';
import type { AssignmentFilters, AssignmentListRow } from './domain/assignment-types';
import { DEFAULT_ASSIGNMENT_FILTERS } from './domain/assignment-types';
import { agentGroupsService } from './api';
import { useAgentGroupAssignments } from './hooks/use-agent-group-assignments';
import { buildAgentGroupAssignmentsTableConfig } from './agent-group-assignments-table-config';

function fmtMetric(v: number | null, suffix = ''): string {
  if (v == null) return '—';
  return suffix ? `${v.toFixed(2)} ${suffix}` : String(v);
}

export function AgentGroupAssignmentsPage() {
  const { groupCode = '' } = useParams<{ groupCode: string }>();
  const { t, i18n } = useTranslation();
  const tr = i18n.language === 'tr';
  const navigate = useNavigate();
  const { role } = useRole();
  const permissions = getAssignmentPermissions(role);

  const { group, agentOptions, assign, remove, refresh } = useAgentGroupAssignments(groupCode);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [tableVersion, setTableVersion] = useState(0);
  const lastFilters = useRef<AssignmentFilters>(DEFAULT_ASSIGNMENT_FILTERS);

  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });

  const isPassiveGroup = group?.status === 'Passive';
  const canMutate = permissions.insert && !isPassiveGroup;

  const tableConfig = useMemo(
    () =>
      buildAgentGroupAssignmentsTableConfig(groupCode, translate, (f) => {
        lastFilters.current = f;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [groupCode, i18n.language, tableVersion],
  );

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(tr ? 'tr-TR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });

  const handleAssign = (agentId: number) => {
    const result = assign(agentId);
    if (!result.ok) {
      toast.error(t(result.error ?? 'aga_assign_failed'));
      return;
    }
    if (result.noOp) {
      toast.info(t('aga_already_in_group'));
    } else {
      toast.success(t('aga_assigned'));
    }
    setAssignModalOpen(false);
    setTableVersion((v) => v + 1);
    refresh();
  };

  const handleRemove = (row: AssignmentListRow) => {
    if (row.status !== 'Active') return;
    if (!window.confirm(t('aga_remove_confirm', { name: row.agentName }))) return;
    const result = remove(row.id);
    if (!result.ok) {
      toast.error(t(result.error ?? 'aga_remove_failed'));
      return;
    }
    toast.success(t('aga_removed'));
    setTableVersion((v) => v + 1);
    refresh();
  };

  const csvColumns: CsvColumn<AssignmentListRow>[] = useMemo(
    () => [
      { header: t('aga_col_code'), value: (r) => r.agentCode },
      { header: t('aga_col_name'), value: (r) => r.agentName },
      { header: t('ef_city'), value: (r) => r.city },
      { header: t('aga_col_district'), value: (r) => r.district },
      { header: t('aga_col_avg_fee'), value: (r) => fmtMetric(r.avgFeePerTx, 'TL') },
      { header: t('aga_col_avg_tx'), value: (r) => fmtMetric(r.avgTxCount) },
      { header: t('aga_col_current_group'), value: (r) => r.currentGroupName },
      { header: t('aga_col_assigned_at'), value: (r) => r.assignedAt.slice(0, 10) },
      { header: t('scf_col_status'), value: (r) => r.status },
    ],
    [t],
  );

  const handleExport = () => {
    const rows = agentGroupsService.listGroupAssignments(groupCode, lastFilters.current);
    exportCsv(`grup-${groupCode.toLowerCase()}-temsilciler`, rows, csvColumns);
    toast.success(t('wl_export_ok'));
  };

  const customFunctions = useMemo(
    () => ({
      renderDistrict: (_v: unknown, row: Record<string, unknown>) => (
        <span className="fs-12">{(row as AssignmentListRow).district || '—'}</span>
      ),
      renderAvgFee: (_v: unknown, row: Record<string, unknown>) => (
        <span className="mono fs-12">{fmtMetric((row as AssignmentListRow).avgFeePerTx, 'TL')}</span>
      ),
      renderAvgTx: (_v: unknown, row: Record<string, unknown>) => (
        <span className="mono fs-12">{fmtMetric((row as AssignmentListRow).avgTxCount)}</span>
      ),
      renderAssignedAt: (_v: unknown, row: Record<string, unknown>) => (
        <span className="mono fs-12">{fmtDate(String((row as AssignmentListRow).assignedAt))}</span>
      ),
      renderStatus: (_v: unknown, row: Record<string, unknown>) => {
        const r = row as AssignmentListRow;
        return (
          <span className={r.status === 'Active' ? 'st active' : 'st inactive'}>
            {t(`aga_status_${r.status}`, r.status)}
          </span>
        );
      },
      renderActions: (_v: unknown, row: Record<string, unknown>) => {
        const r = row as AssignmentListRow;
        if (!permissions.remove || r.status !== 'Active' || isPassiveGroup) return null;
        return (
          <div className="row-actions">
            <button type="button" title={t('aga_remove')} onClick={() => handleRemove(r)}>
              <UserMinus size={14} />
            </button>
          </div>
        );
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, tr, permissions.remove, isPassiveGroup],
  );

  if (!group) {
    return (
      <PageHead
        title={t('aga_not_found_title')}
        subtitle={t('aga_not_found_sub')}
        actions={
          <Button variant="ghost" onClick={() => navigate('/agents/groups')}>
            <ArrowLeft size={14} /> {t('aga_back_groups')}
          </Button>
        }
      />
    );
  }

  return (
    <>
      <PageHead
        title={t('aga_title')}
        subtitle={t('aga_subtitle', { code: group.groupCode, name: group.name })}
      />

      <div
        className="page-meta-row"
        style={{ marginBottom: 12, display: 'flex', gap: 16, alignItems: 'center' }}
      >
        <Link
          to="/agents/groups"
          className="fs-12 t-mute"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <ArrowLeft size={13} />
          {t('aga_back_groups')}
        </Link>
        <span className="fs-12">
          <span className="t-mute">{t('agg_col_code')}:</span>{' '}
          <span className="mono">{group.groupCode}</span>
        </span>
        <span className="fs-12">
          <span className="t-mute">{t('agg_col_name')}:</span> {group.name}
        </span>
      </div>

      {isPassiveGroup && (
        <div className="banner warn" style={{ marginBottom: 12 }}>
          {t('aga_passive_group_banner')}
        </div>
      )}

      <DynamicTable
        config={tableConfig}
        header={{ title: '', subtitle: '' }}
        permissions={{
          new: canMutate,
          edit: false,
          delete: false,
          view: false,
          export: permissions.export,
        }}
        customFunctions={customFunctions}
        locale={i18n.language}
        t={translate}
        onNew={canMutate ? () => setAssignModalOpen(true) : undefined}
        onExport={permissions.export ? handleExport : undefined}
      />

      <p className="fs-11 t-mute" style={{ marginTop: 10 }}>
        {t('aga_hint')}
      </p>

      <AssignAgentModal
        open={assignModalOpen}
        groupCode={groupCode}
        agents={agentOptions}
        onClose={() => setAssignModalOpen(false)}
        onAssign={handleAssign}
      />
    </>
  );
}
