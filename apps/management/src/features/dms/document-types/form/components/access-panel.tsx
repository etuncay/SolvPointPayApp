import { useTranslation } from 'react-i18next';
import type { BackOfficeRole } from '@epay/ui';
import type { UseFormReturn } from 'react-hook-form';
import { Field, FormCard } from '@epay/ui';
import type { DocumentTypeFormValues } from '../domain/form-types';
import { DOCUMENT_TYPE_ROLE_OPTIONS, ROLE_I18N_KEYS } from '../domain/role-options';

type Props = {
  form: UseFormReturn<DocumentTypeFormValues>;
  approvalRequired: boolean;
  disabled?: boolean;
};

function RoleCheckboxGroup({
  label,
  roles,
  selected,
  onChange,
  disabled,
}: {
  label: string;
  roles: BackOfficeRole[];
  selected: BackOfficeRole[];
  onChange: (next: BackOfficeRole[]) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation();

  const toggle = (role: BackOfficeRole) => {
    if (disabled) return;
    if (selected.includes(role)) {
      onChange(selected.filter((r) => r !== role));
    } else {
      onChange([...selected, role]);
    }
  };

  return (
    <Field label={label} required>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {roles.map((role) => (
          <label key={role} className="check-row">
            <input
              type="checkbox"
              checked={selected.includes(role)}
              disabled={disabled}
              onChange={() => toggle(role)}
            />
            <span>{t(ROLE_I18N_KEYS[role])}</span>
          </label>
        ))}
      </div>
    </Field>
  );
}

export function AccessPanel({ form, approvalRequired, disabled }: Props) {
  const { t } = useTranslation();
  const viewerRoles = form.watch('viewerRoles');
  const approverRoles = form.watch('approverRoles');

  return (
    <FormCard title={t('dtf_panel_access')}>
      <RoleCheckboxGroup
        label={t('dtf_viewer_roles')}
        roles={DOCUMENT_TYPE_ROLE_OPTIONS}
        selected={viewerRoles}
        onChange={(next) => form.setValue('viewerRoles', next, { shouldDirty: true })}
        disabled={disabled}
      />
      <RoleCheckboxGroup
        label={t('dtf_approver_roles')}
        roles={DOCUMENT_TYPE_ROLE_OPTIONS}
        selected={approverRoles}
        onChange={(next) => form.setValue('approverRoles', next, { shouldDirty: true })}
        disabled={disabled || !approvalRequired}
      />
      {!approvalRequired ? (
        <p className="fs-11 t-mute">{t('dtf_approver_disabled_hint')}</p>
      ) : null}
    </FormCard>
  );
}
