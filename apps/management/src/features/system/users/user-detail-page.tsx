import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Activity, ArrowLeft, Save } from 'lucide-react';
import { Button, Field, FormCard, FormGrid, FormLayout, FormPrimaryActions, PageHead } from '@epay/ui';
import { useRole } from '@/domain/role-context';
import { getCurrentUser } from '@/features/approval-pool/domain/current-user';
import { PassiveRoleBanner } from './components/passive-role-banner';
import { UserStatusPill } from './components/user-status-pill';
import { canAccessUsersModule, getUserPermissions } from './domain/permissions';
import { useUserDetail } from './hooks/use-user-detail';

export function UserDetailPage() {
  const { t, i18n } = useTranslation();
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { role } = useRole();
  const perms = getUserPermissions(role);
  const currentUser = getCurrentUser(role);
  const { detail, loading, saveRole, assignableRoles } = useUserDetail(role, userId);

  const [roleId, setRoleId] = useState<string>('');
  const [validFrom, setValidFrom] = useState('');
  const [validTo, setValidTo] = useState('');

  useEffect(() => {
    if (!detail) return;
    setRoleId(detail.roleId ?? '');
    setValidFrom(detail.validFrom?.slice(0, 10) ?? '');
    setValidTo(detail.validTo?.slice(0, 10) ?? '');
  }, [detail]);

  const dirty = useMemo(() => {
    if (!detail) return false;
    const r = roleId || null;
    const vf = validFrom || null;
    const vt = validTo || null;
    return (
      r !== detail.roleId ||
      vf !== (detail.validFrom?.slice(0, 10) ?? null) ||
      vt !== (detail.validTo?.slice(0, 10) ?? null)
    );
  }, [detail, roleId, validFrom, validTo]);

  const tr = i18n.language === 'tr';

  if (!canAccessUsersModule(role)) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="empty-state" style={{ padding: 48 }}>
        <p className="t-mute">…</p>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="empty-state" style={{ padding: 48 }}>
        <h3>{t('usr_not_found')}</h3>
        <Button type="button" variant="ghost" onClick={() => navigate('/system/users')}>
          <ArrowLeft size={14} /> {t('fr_back_list')}
        </Button>
      </div>
    );
  }

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(tr ? 'tr-TR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });

  const onSave = async () => {
    if (!perms.assignRole || !dirty) return;
    const result = await saveRole(currentUser.id, {
      roleId: roleId || null,
      validFrom: validFrom || null,
      validTo: validTo || null,
    });
    if (!result.ok) {
      toast.error(t(result.errorCode, result.errorCode));
      return;
    }
    toast.success(t('usr_saved_ok'));
  };

  return (
    <>
      <PageHead
        title={detail.fullName}
        subtitle={detail.userNo}
        actions={
          <FormPrimaryActions
            leading={
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate(`/system/users/${detail.id}/activities`)}
              >
                <Activity size={14} /> {t('usr_activities')}
              </Button>
            }
            showSave={perms.assignRole}
            onSave={onSave}
            saveLabel={
              <>
                <Save size={14} /> {t('ib_save')}
              </>
            }
            saveDisabled={!dirty}
            showCancel
            onCancel={() => navigate('/system/users')}
            cancelLabel={
              <>
                <ArrowLeft size={14} /> {t('fr_back_list')}
              </>
            }
          />
        }
      />

      {detail.roleStatus === 'Passive' ? <PassiveRoleBanner /> : null}

      <FormLayout>
        <FormCard title={detail.fullName}>
          <FormGrid cols={2}>
            <Field label={t('usr_field_no')}>
              <input className="input mono" value={detail.userNo} readOnly disabled />
            </Field>
            <Field label={t('usr_col_name')}>
              <input className="input" value={detail.fullName} readOnly disabled />
            </Field>
            <Field label={t('fcd_customer_email')}>
              <input className="input" value={detail.email} readOnly disabled />
            </Field>
            <Field label={t('fcd_customer_phone')}>
              <input className="input mono" value={detail.phone} readOnly disabled />
            </Field>
            <Field label={t('usr_col_role')}>
              <select
                className="select"
                value={roleId}
                disabled={!perms.assignRole}
                onChange={(e) => setRoleId(e.target.value)}
              >
                <option value="">{t('scf_none')}</option>
                {assignableRoles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t('dr_col_created')}>
              <input className="input mono" value={fmtDate(detail.createdAt)} readOnly disabled />
            </Field>
            <Field label={t('scf_col_status')}>
              <UserStatusPill status={detail.status} />
            </Field>
            <Field label={t('du_field_valid_from')}>
              <input
                type="date"
                className="input mono"
                value={validFrom}
                disabled={!perms.assignRole}
                onChange={(e) => setValidFrom(e.target.value)}
              />
            </Field>
            <Field label={t('usr_field_valid_to')}>
              <input
                type="date"
                className="input mono"
                value={validTo}
                disabled={!perms.assignRole}
                onChange={(e) => setValidTo(e.target.value)}
              />
            </Field>
          </FormGrid>
        </FormCard>
      </FormLayout>
    </>
  );
}
