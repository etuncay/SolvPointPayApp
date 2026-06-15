import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import { Field, FormCard, FormGrid, FormLayout, FormPrimaryActions, PageHead } from '@epay/ui';
import { useRole } from '@/domain/role-context';
import { rolesService } from './api/mock-roles-adapter';
import { canMutateRoles } from './domain/permissions';

export function RoleFormPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role } = useRole();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  if (!canMutateRoles(role)) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = () => {
    const result = rolesService.create(role, { name, description });
    if (!result.ok) {
      toast.error(t(result.errorCode, result.errorCode));
      return;
    }
    toast.success(t('rol_created_ok'));
    navigate(`/system/roles/${result.role.id}`);
  };

  return (
    <>
      <PageHead
        title={t('rol_new')}
        subtitle={t('rol_new_subtitle')}
        actions={
          <FormPrimaryActions
            showSave
            onSave={onSubmit}
            saveLabel={
              <>
                <Save size={14} /> {t('sj_create')}
              </>
            }
            saveDisabled={!name.trim()}
            showCancel
            onCancel={() => navigate('/system/roles')}
            cancelLabel={t('fr_back_list')}
          />
        }
      />
      <FormLayout>
        <FormCard title={t('rol_new')}>
          <FormGrid cols={2}>
            <Field label={t('rol_col_name')} required>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label={t('rpt_col_desc')} col={2}>
              <textarea
                className="input"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>
          </FormGrid>
        </FormCard>
      </FormLayout>
    </>
  );
}
