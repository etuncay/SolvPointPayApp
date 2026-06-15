import type { FormConfig, TranslateFn } from '@epay/ui';
import parameterFormJson from './config/parameter.form.config.json';

const FIELD_KEYS: Record<string, string> = {
  groupName: 'fcd_agent_group',
  parameterKey: 'prm_col_key',
  valueType: 'prm_col_value_type',
  description: 'rpt_col_desc',
  value: 'rm_hist_col_value',
  status: 'rpt_col_status',
};

export function buildParameterFormConfig(t?: TranslateFn): FormConfig {
  const base = parameterFormJson as FormConfig;
  if (!t) return base;
  return {
    ...base,
    fields: base.fields?.map((f) => ({
      ...f,
      label: f.label ? t(FIELD_KEYS[f.name] ?? f.name, f.label) : f.label,
      options:
        f.type === 'Select' && f.options
          ? f.options.map((o) => ({
              ...o,
              label:
                o.value === 'Active'
                  ? t('ib_status_Active', o.label)
                  : o.value === 'Passive'
                    ? t('rs_status_passive', o.label)
                    : o.label,
            }))
          : f.options,
    })),
  };
}
