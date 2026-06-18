import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { DynamicForm, DynamicTable, FormMode, type TableCustomFunctions } from '@epay/ui';
import { settingsService } from '../api/settings-service';
import { buildAddressesTableConfig } from '../settings-table-config';
import { buildAddressAddFormConfig } from '../settings-form-config';
import { useAgentUiPermissions } from '@/hooks/use-agent-ui-permissions';

/** 1.3 › Adresler — DynamicForm (ekle) + DynamicTable (liste). */
export function AddressesTab() {
  const { t, i18n } = useTranslation();
  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });
  const [listVersion, setListVersion] = useState(0);
  const [formKey, setFormKey] = useState(0);
  const ui = useAgentUiPermissions();
  const refresh = () => setListVersion((v) => v + 1);

  const tableConfig = useMemo(
    () => buildAddressesTableConfig(translate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language, listVersion],
  );
  const addFormConfig = useMemo(
    () => buildAddressAddFormConfig(translate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language],
  );

  const customFunctions: TableCustomFunctions = useMemo(
    () => ({
      renderAddressRemove: (_val: unknown, row: Record<string, unknown>) => (
        <button
          type="button"
          className="link-btn"
          onClick={() => {
            settingsService.removeAddress(Number(row.id));
            refresh();
          }}
        >
          <Trash2 size={14} />
        </button>
      ),
    }),
    [],
  );

  const handleAdd = (values: Record<string, unknown>) => {
    settingsService.addAddress({
      title: String(values.title ?? '').trim(),
      line: String(values.line ?? '').trim(),
      city: String(values.city ?? '').trim(),
      country: String(values.country ?? 'TUR').trim() || 'TUR',
    });
    toast.success(t('rs_saved'));
    setFormKey((k) => k + 1);
    refresh();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <DynamicForm
        key={formKey}
        config={addFormConfig}
        mode={FormMode.Create}
        permissions={ui.form.settingsAddressAdd}
        t={translate}
        header={{ hidePageHead: true, saveLabel: t('ag_ad_add') }}
        onSubmit={handleAdd}
      />
      <DynamicTable
        config={tableConfig}
        permissions={ui.table.settingsAddresses}
        customFunctions={customFunctions}
        locale={i18n.language}
        t={translate}
      />
    </div>
  );
}
