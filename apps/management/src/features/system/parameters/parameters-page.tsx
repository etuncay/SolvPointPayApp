import { useCallback, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Pencil, RefreshCw } from 'lucide-react';
import { Button, DynamicTable } from '@epay/ui';
import type { ParameterFormInput, SystemParameter } from './domain/types';
import { useRole } from '@/domain/role-context';
import { getCurrentUser } from '@/features/approval-pool/domain/current-user';
import { ParameterFormModal } from './components/parameter-form-modal';
import { ParameterStatusPill } from './components/parameter-status-pill';
import { ParameterValueCell } from './components/parameter-value-cell';
import { parametersService } from './api/mock-parameters-adapter';
import { createParameterFormApprovalRequest } from './api/parameter-approval-bridge';
import { canAccessParameters, canInsertParameters, canUpdateParameters } from './domain/permissions';
import { needsCriticalZeroConfirm, validateParameterValue } from './domain/validate-parameter-value';
import { buildParametersTableConfig } from './parameters-table-config';

function toFormInput(row: SystemParameter): ParameterFormInput {
  return {
    parameterKey: row.parameterKey,
    groupName: row.groupName,
    valueType: row.valueType,
    description: row.description,
    value: row.value,
    status: row.status,
  };
}

export function ParametersPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { role } = useRole();
  const canEdit = canUpdateParameters(role);
  const canCreate = canInsertParameters(role);
  const user = getCurrentUser(role);
  const translate = useCallback(
    (key: string, fb?: string) => t(key, { defaultValue: fb ?? key }),
    [t],
  );

  const [rev, setRev] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingParameter, setEditingParameter] = useState<SystemParameter | null>(null);

  const tableConfig = useMemo(
    () => buildParametersTableConfig(role, translate),
    [role, translate],
  );

  const bump = useCallback(() => setRev((v) => v + 1), []);

  const fmtDate = useCallback(
    (iso: string) =>
      new Date(iso).toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    [i18n.language],
  );

  const openCreate = useCallback(() => {
    setModalMode('create');
    setEditingParameter(null);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((row: SystemParameter) => {
    setModalMode('edit');
    setEditingParameter(row);
    setModalOpen(true);
  }, []);

  const closeModal = () => {
    setModalOpen(false);
    setEditingParameter(null);
  };

  const submitToApproval = useCallback(
    (input: ParameterFormInput, id?: string, skipCriticalConfirm = false) => {
      const err = validateParameterValue(input.parameterKey, input.value);
      if (err) {
        toast.error(t(err, err));
        return;
      }

      if (
        !skipCriticalConfirm &&
        needsCriticalZeroConfirm(input.parameterKey, input.value)
      ) {
        const ok = window.confirm(t('prm_critical_zero_confirm'));
        if (!ok) return;
        skipCriticalConfirm = true;
      }

      const result = createParameterFormApprovalRequest({
        mode: id == null ? 'new' : 'edit',
        parameterId: id ?? null,
        values: input,
        oldValues: id != null && editingParameter ? toFormInput(editingParameter) : null,
        role,
        userId: user.id,
        skipCriticalConfirm,
      });

      if (!result.ok) {
        toast.error(t(result.error ?? 'prm_save_failed'));
        return;
      }
      toast.success(t('if_sent_to_approval'));
      closeModal();
      bump();
      navigate('/approvals', { state: { reviewId: result.approvalId } });
    },
    [bump, editingParameter, navigate, role, t, user.id],
  );

  const handleSave = (input: ParameterFormInput, id?: string) => {
    submitToApproval(input, id);
  };

  const customFunctions = useMemo(
    () => ({
      renderGroup: (val: unknown) => t(`prm_group_${String(val)}`, String(val)),
      renderDescription: (val: unknown) => t(String(val ?? ''), String(val ?? '')),
      renderValue: (_val: unknown, row: Record<string, unknown>) => {
        const r = row as unknown as SystemParameter;
        return (
          <ParameterValueCell valueType={r.valueType} value={r.value} disabled onChange={() => {}} />
        );
      },
      renderStatus: (_val: unknown, row: Record<string, unknown>) => {
        const r = row as unknown as SystemParameter;
        return <ParameterStatusPill status={r.status} />;
      },
      renderDate: (val: unknown) => <span className="mono">{fmtDate(String(val ?? ''))}</span>,
      renderActions: (_val: unknown, row: Record<string, unknown>) => {
        const r = row as unknown as SystemParameter;
        if (!canEdit) return <span className="t-mute">—</span>;
        return (
          <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
            <Button type="button" variant="ghost" size="sm" title={t('prm_edit')} onClick={() => openEdit(r)}>
              <Pencil size={12} />
            </Button>
          </div>
        );
      },
    }),
    [canEdit, fmtDate, openEdit, t],
  );

  if (!canAccessParameters(role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <DynamicTable
        config={tableConfig}
        header={{
          title: t('rm_panel_params'),
          subtitle: t('prm_page_subtitle'),
          trailing: (
            <Button type="button" variant="ghost" size="sm" onClick={bump}>
              <RefreshCw size={14} /> {t('refresh_all')}
            </Button>
          ),
        }}
        permissions={{ new: canCreate }}
        onNew={canCreate ? openCreate : undefined}
        customFunctions={customFunctions}
        locale={i18n.language}
        t={translate}
        key={rev}
      />

      <p className="fs-11 t-mute" style={{ marginTop: 10 }}>
        {t('prm_hint_approval')}
      </p>

      <ParameterFormModal
        open={modalOpen}
        mode={modalMode}
        parameter={editingParameter}
        onClose={closeModal}
        onSave={handleSave}
      />
    </>
  );
}
