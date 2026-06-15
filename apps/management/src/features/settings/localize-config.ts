import type { FormConfig, TableConfig, TranslateFn } from '@epay/ui';

type TableConfigJson = Omit<TableConfig, 'api'>;

const FAILED_LOGINS_COL: Record<string, string> = {
  ip: 'col_ip',
  loc: 'col_loc',
  when: 'col_when',
  ua: 'col_ua',
};

export function localizeFailedLoginsTableConfig(base: TableConfigJson, t: TranslateFn): TableConfigJson {
  return {
    ...base,
    title: t('s_tab_failed', base.title),
    columns: base.columns.map((c) => ({
      ...c,
      title: t(FAILED_LOGINS_COL[c.key] ?? c.key, c.title),
    })),
  };
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
