import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { BadgeCheck, Star, Trash2 } from 'lucide-react';
import { DynamicForm, DynamicTable, FormMode, type TableCustomFunctions } from '@epay/ui';
import { settingsService } from '../api/settings-service';
import type { ContactChannel } from '../api/agent-settings-store';
import { buildContactsTableConfig } from '../settings-table-config';
import { buildContactAddFormConfig } from '../settings-form-config';
import { useAgentUiPermissions } from '@/hooks/use-agent-ui-permissions';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?\d[\d\s]{8,}$/;

/** 1.3 › İletişim Bilgileri — DynamicForm (ekle) + DynamicTable (liste). */
export function ContactsTab() {
  const { t, i18n } = useTranslation();
  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });
  const [listVersion, setListVersion] = useState(0);
  const [formKey, setFormKey] = useState(0);
  const ui = useAgentUiPermissions();
  const refresh = () => setListVersion((v) => v + 1);

  const tableConfig = useMemo(
    () => buildContactsTableConfig(translate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language, listVersion],
  );
  const addFormConfig = useMemo(
    () => buildContactAddFormConfig(translate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language],
  );

  const customFunctions: TableCustomFunctions = useMemo(
    () => ({
      renderContactChannel: (val: unknown) =>
        t(val === 'email' ? 'ag_ct_email' : 'ag_ct_phone'),
      renderContactValue: (val: unknown, row: Record<string, unknown>) => (
        <span className="mono">
          {String(val)}
          {row.isPrimary === true ? <span className="t-mute"> · {t('ag_ct_primary')}</span> : null}
        </span>
      ),
      renderContactStatus: (val: unknown) => (val ? t('ag_ct_verified') : t('ag_ct_unverified')),
      renderContactActions: (_val: unknown, row: Record<string, unknown>) => {
        const verified = row.verified === true;
        const isPrimary = row.isPrimary === true;
        return (
        <span style={{ whiteSpace: 'nowrap' }}>
          {!verified && (
            <button
              type="button"
              className="link-btn"
              title={t('ag_ct_verify')}
              onClick={() => {
                settingsService.verifyContact(Number(row.id));
                toast.success(t('ag_ct_verified'));
                refresh();
              }}
            >
              <BadgeCheck size={14} />
            </button>
          )}
          {verified && !isPrimary && (
            <button
              type="button"
              className="link-btn"
              title={t('ag_ct_set_primary')}
              onClick={() => {
                settingsService.setPrimary(Number(row.id));
                refresh();
              }}
            >
              <Star size={14} />
            </button>
          )}
          {!isPrimary && (
            <button
              type="button"
              className="link-btn"
              title={t('ag_ct_remove')}
              onClick={() => {
                settingsService.removeContact(Number(row.id));
                refresh();
              }}
            >
              <Trash2 size={14} />
            </button>
          )}
        </span>
        );
      },
    }),
    [t],
  );

  const handleAdd = (values: Record<string, unknown>) => {
    const channel = values.channel as ContactChannel;
    const v = String(values.value ?? '').trim();
    if (channel === 'email' && !EMAIL_RE.test(v)) {
      toast.error(t('ag_ct_err_email'));
      return;
    }
    if (channel === 'phone' && !PHONE_RE.test(v)) {
      toast.error(t('ag_ct_err_phone'));
      return;
    }
    if (settingsService.hasContact(v)) {
      toast.error(t('ag_ct_err_dup'));
      return;
    }
    settingsService.addContact(channel, v);
    toast.success(channel === 'email' ? t('ag_ct_verify_email_sent') : t('ag_ct_verify_otp_sent'));
    setFormKey((k) => k + 1);
    refresh();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <DynamicForm
        key={formKey}
        config={addFormConfig}
        mode={FormMode.Create}
        permissions={ui.form.settingsContactAdd}
        customFunctions={{}}
        t={translate}
        header={{ hidePageHead: true, saveLabel: t('ag_ct_add') }}
        onSubmit={handleAdd}
      />
      <DynamicTable
        config={tableConfig}
        permissions={ui.table.settingsContacts}
        customFunctions={customFunctions}
        locale={i18n.language}
        t={translate}
      />
      <p className="t-mute" style={{ fontSize: 11 }}>{t('ag_ct_ratelimit_hint')}</p>
    </div>
  );
}
