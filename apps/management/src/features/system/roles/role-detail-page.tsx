import { useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ArrowLeft, LayoutGrid, Save, SlidersHorizontal } from 'lucide-react';
import { Button, FormLayout, FormPrimaryActions, PageHead, SectionRail } from '@epay/ui';
import { useRole } from '@/domain/role-context';
import { RoleFieldApprovalTable } from './components/role-field-approval-table';
import { RoleStatusPill } from './components/role-status-pill';
import { ScreenPermissionsMatrix } from './components/screen-permissions-matrix';
import type { PermissionFlagKey } from './domain/permission-flags';
import { canAccessRolesModule, canMutateRoles } from './domain/permissions';
import { useRoleDetail } from './hooks/use-role-detail';

export function RoleDetailPage() {
  const { t } = useTranslation();
  const { roleId } = useParams<{ roleId: string }>();
  const navigate = useNavigate();
  const { role } = useRole();
  const canEdit = canMutateRoles(role);
  const vm = useRoleDetail(role, roleId);
  const [activeSec, setActiveSec] = useState('screens');

  const sections = useMemo(
    () => [
      { id: 'screens', no: '1', label: t('rol_tab_screens') },
      { id: 'fields', no: '2', label: t('ar_panel_fields') },
    ],
    [t],
  );

  if (!canAccessRolesModule(role)) {
    return <Navigate to="/" replace />;
  }

  if (vm.loading) {
    return (
      <div className="empty-state" style={{ padding: 48 }}>
        <p className="t-mute">…</p>
      </div>
    );
  }

  if (!vm.detail) {
    return (
      <div className="empty-state" style={{ padding: 48 }}>
        <h3>{t('rol_not_found')}</h3>
        <Button type="button" variant="ghost" onClick={() => navigate('/system/roles')}>
          <ArrowLeft size={14} /> {t('fr_back_list')}
        </Button>
      </div>
    );
  }

  const onSave = async () => {
    const result = await vm.save();
    if (!result.ok) {
      toast.error(t(result.errorCode, result.errorCode));
      return;
    }
    toast.success(t('usr_saved_ok'));
  };

  return (
    <>
      <PageHead
        title={vm.detail.role.name}
        subtitle={vm.detail.role.description || '—'}
        status={<RoleStatusPill status={vm.detail.role.status} />}
        actions={
          <FormPrimaryActions
            showSave={canEdit}
            onSave={onSave}
            saveLabel={
              <>
                <Save size={14} /> {t('ib_save')}
              </>
            }
            saveDisabled={!vm.dirty}
            showCancel
            onCancel={() => navigate('/system/roles')}
            cancelLabel={
              <>
                <ArrowLeft size={14} /> {t('fr_back_list')}
              </>
            }
          />
        }
      />

      <div className="card" style={{ padding: 16, marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        <label className="fs-12">
          <span className="t-mute">{t('rol_col_name')}</span>
          <input
            className="input"
            disabled={!canEdit}
            value={vm.metaDraft.name}
            onChange={(e) => vm.setMetaDraft((m) => ({ ...m, name: e.target.value }))}
          />
        </label>
        <label className="fs-12" style={{ flex: 1, minWidth: 200 }}>
          <span className="t-mute">{t('rpt_col_desc')}</span>
          <input
            className="input"
            disabled={!canEdit}
            value={vm.metaDraft.description}
            onChange={(e) => vm.setMetaDraft((m) => ({ ...m, description: e.target.value }))}
          />
        </label>
        <label className="fs-12">
          <span className="t-mute">{t('scf_col_status')}</span>
          <select
            className="select"
            disabled={!canEdit}
            value={vm.metaDraft.status}
            onChange={(e) =>
              vm.setMetaDraft((m) => ({
                ...m,
                status: e.target.value as typeof m.status,
              }))
            }
          >
            <option value="Active">{t('usr_status_Active')}</option>
            <option value="Passive">{t('rol_status_Passive')}</option>
          </select>
        </label>
      </div>

      {vm.detail.assignedUserCount > 0 && vm.metaDraft.status === 'Passive' ? (
        <p className="fs-12 t-mute" style={{ marginBottom: 12 }}>
          {t('rol_passive_users_warn', { n: vm.detail.assignedUserCount })}
        </p>
      ) : null}

      <FormLayout
        rail={
          <SectionRail
            sections={sections}
            activeId={activeSec}
            title={t('rol_detail_title')}
            onNavigate={setActiveSec}
          />
        }
      >
        {activeSec === 'screens' ? (
          <ScreenPermissionsMatrix
            rows={vm.permDraft}
            canEdit={canEdit}
            onToggle={(screenId, flag, value) =>
              vm.patchPermission(screenId, flag as PermissionFlagKey, value)
            }
          />
        ) : (
          <RoleFieldApprovalTable
            rows={vm.fieldDraft.map((r) => ({ ...r, roleId: roleId! }))}
            canEdit={canEdit}
            onChange={vm.setFieldApprovals}
          />
        )}
      </FormLayout>
    </>
  );
}
