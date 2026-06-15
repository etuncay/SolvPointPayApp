import type { FieldConfig, FormConfig, TableConfig, TranslateFn } from '@epay/ui';

type TableConfigJson = Omit<TableConfig, 'api'>;

const RECEIPTS_COL: Record<string, string> = {
  transactionNo: 'ag_home_col_tx_no',
  date: 'ag_home_col_date',
  amount: 'ag_home_col_amount',
  currency: 'ag_home_col_currency',
};

const CONTACTS_COL: Record<string, string> = {
  channel: 'ag_ct_channel',
  value: 'ag_ct_value',
  verified: 'ag_ct_status',
};

const ADDRESSES_COL: Record<string, string> = {
  title: 'ag_ad_title',
  line: 'ag_ad_line',
  city: 'ag_ad_city',
};

const USERS_COL: Record<string, string> = {
  name: 'rpt_col_name',
  email: 'ag_ct_email',
  role: 'ag_us_role',
  dailyLimit: 'ag_us_daily_limit',
  active: 'rpt_col_status',
};

function localizeField(t: TranslateFn, field: FieldConfig): FieldConfig {
  if (field.type === 'Row' && field.fields) {
    return { ...field, fields: field.fields.map((f) => localizeField(t, f)) };
  }
  const { name } = field;
  let options = field.options;
  if (name === 'channel' && options) {
    options = options.map((o) => ({
      ...o,
      label: t(o.value === 'email' ? 'ag_ct_email' : 'ag_ct_phone', o.label),
    }));
  }
  return {
    ...field,
    label: field.label ? t(`ag_set_field_${name}`, field.label) : field.label,
    placeholder: field.placeholder ? t(`ag_set_ph_${name}`, field.placeholder) : field.placeholder,
    options,
    rules: field.rules?.map((r) => ({
      ...r,
      message: r.message ? t(`ag_set_rule_${name}`, r.message) : r.message,
    })),
  };
}

export function localizeSettingsTableConfig(
  base: TableConfigJson,
  colMap: Record<string, string>,
  titleKey: string,
  t: TranslateFn,
): TableConfigJson {
  return {
    ...base,
    title: t(titleKey, base.title),
    columns: base.columns.map((c) => ({
      ...c,
      title: c.key === 'actions' ? '' : t(colMap[c.key] ?? c.key, c.title),
    })),
  };
}

export function localizeReceiptsTableConfig(base: TableConfigJson, t: TranslateFn): TableConfigJson {
  return localizeSettingsTableConfig(base, RECEIPTS_COL, 'ag_rc_title', t);
}

export function localizeContactsTableConfig(base: TableConfigJson, t: TranslateFn): TableConfigJson {
  return localizeSettingsTableConfig(base, CONTACTS_COL, 'ag_ct_list_title', t);
}

export function localizeAddressesTableConfig(base: TableConfigJson, t: TranslateFn): TableConfigJson {
  return localizeSettingsTableConfig(base, ADDRESSES_COL, 'ag_ad_list_title', t);
}

export function localizeUsersTableConfig(base: TableConfigJson, t: TranslateFn): TableConfigJson {
  return localizeSettingsTableConfig(base, USERS_COL, 'ag_us_list_title', t);
}

export function localizeContactAddFormConfig(base: FormConfig, t: TranslateFn): FormConfig {
  return {
    ...base,
    fields: base.fields?.map((f) => localizeField(t, f)),
    buttonToolbar: base.buttonToolbar
      ? {
          ...base.buttonToolbar,
          buttons: base.buttonToolbar.buttons.map((b) => ({
            ...b,
            label: t(`ag_set_btn_${b.key}`, b.label),
          })),
        }
      : base.buttonToolbar,
  };
}

export function localizeAddressAddFormConfig(base: FormConfig, t: TranslateFn): FormConfig {
  return {
    ...base,
    fields: base.fields?.map((f) => localizeField(t, f)),
    buttonToolbar: base.buttonToolbar
      ? {
          ...base.buttonToolbar,
          buttons: base.buttonToolbar.buttons.map((b) => ({
            ...b,
            label: t(`ag_set_btn_${b.key}`, b.label),
          })),
        }
      : base.buttonToolbar,
  };
}

const FAILED_LOGINS_COL: Record<string, string> = {
  ip: 'col_ip',
  loc: 'col_loc',
  when: 'col_when',
  ua: 'col_ua',
};

export function localizeFailedLoginsTableConfig(base: TableConfigJson, t: TranslateFn): TableConfigJson {
  return localizeSettingsTableConfig(base, FAILED_LOGINS_COL, 's_failed_intro', t);
}

export function localizePasswordChangeFormConfig(base: FormConfig, t: TranslateFn): FormConfig {
  return {
    ...base,
    fields: base.fields?.map((f) => ({
      ...f,
      label: t(
        f.name === 'oldPassword'
          ? 's_old_pw'
          : f.name === 'newPassword'
            ? 's_new_pw'
            : f.name === 'confirmPassword'
              ? 's_new_pw2'
              : 's_pw_freq',
        f.label,
      ),
      options:
        f.name === 'frequency'
          ? [
              { label: t('s_1m'), value: '1' },
              { label: t('s_3m'), value: '3' },
              { label: t('s_6m'), value: '6' },
            ]
          : f.options,
    })),
    buttonToolbar: base.buttonToolbar
      ? {
          ...base.buttonToolbar,
          buttons: base.buttonToolbar.buttons.map((b) => ({
            ...b,
            label: t('s_change_pw', b.label),
          })),
        }
      : base.buttonToolbar,
  };
}

export function localizeWelcomeMessageFormConfig(base: FormConfig, t: TranslateFn): FormConfig {
  return {
    ...base,
    fields: base.fields?.map((f) => ({
      ...f,
      label: t('s_welcome_label', f.label),
      placeholder: t('s_welcome_hint', f.placeholder),
    })),
    buttonToolbar: base.buttonToolbar
      ? {
          ...base.buttonToolbar,
          buttons: base.buttonToolbar.buttons.map((b) => ({
            ...b,
            label: t('ib_save', b.label),
          })),
        }
      : base.buttonToolbar,
  };
}

export function localizeAppPreferencesFormConfig(base: FormConfig, t: TranslateFn): FormConfig {
  return {
    ...base,
    fields: base.fields?.map((f) => {
      if (f.name === 'lang') {
        return {
          ...f,
          label: t('s_language', f.label),
          options: [
            { label: 'Türkçe', value: 'tr' },
            { label: 'English', value: 'en' },
            { label: t('s_language_ar'), value: 'ar' },
          ],
        };
      }
      if (f.name === 'theme') {
        return {
          ...f,
          label: t('s_theme', f.label),
          options: [
            { label: t('s_theme_light'), value: 'light' },
            { label: t('s_theme_dark'), value: 'dark' },
          ],
        };
      }
      if (f.name === 'textSize') {
        return {
          ...f,
          label: t('s_textsize', f.label),
          options: [
            { label: t('s_sz_s'), value: 'small' },
            { label: t('s_sz_m'), value: 'standard' },
            { label: t('s_sz_l'), value: 'large' },
            { label: t('s_sz_xl'), value: 'xlarge' },
          ],
        };
      }
      return f;
    }),
    buttonToolbar: base.buttonToolbar
      ? {
          ...base.buttonToolbar,
          buttons: base.buttonToolbar.buttons.map((b) => ({
            ...b,
            label: t('ib_save', b.label),
          })),
        }
      : base.buttonToolbar,
  };
}
