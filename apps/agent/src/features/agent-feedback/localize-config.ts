import type { FieldConfig, FieldRule, FormConfig, TranslateFn } from '@epay/ui';
import { complaintTypeI18nKey, AGENT_COMPLAINT_TYPES } from './domain/complaint-type';

const FIELD_KEYS: Record<string, string> = {
  requesterOwner: 'ag_fb_field_owner',
  customerNo: 'ag_fb_field_customer_no',
  subject: 'ag_fb_field_subject',
  complaintType: 'ag_fb_field_type',
  detail: 'ag_fb_field_detail',
  notes: 'ag_fb_field_notes',
  attachments: 'ag_fb_field_files',
};

const PLACEHOLDER_KEYS: Record<string, string> = {
  subject: 'ag_fb_ph_subject',
  detail: 'ag_fb_ph_detail',
  notes: 'ag_fb_ph_notes',
};

const BUTTON_KEYS: Record<string, string> = {
  submit: 'ag_fb_btn_submit',
  clear: 'ag_fb_btn_clear',
  addFile: 'ag_fb_btn_add_file',
};

function localizeRules(t: TranslateFn, rules: FieldRule[] | undefined): FieldRule[] | undefined {
  if (!rules?.length) return rules;
  return rules.map((r) => ({
    ...r,
    message: r.message ? t(r.message, r.message) : r.message,
    patternMessage: r.patternMessage ? t(r.patternMessage, r.patternMessage) : r.patternMessage,
    expressionMessage: r.expressionMessage
      ? t(r.expressionMessage, r.expressionMessage)
      : r.expressionMessage,
  }));
}

function localizeField(t: TranslateFn, field: FieldConfig): FieldConfig {
  if (field.type === 'Row' && field.fields) {
    return { ...field, fields: field.fields.map((f) => localizeField(t, f)) };
  }

  const localized: FieldConfig = {
    ...field,
    label: field.label ? t(FIELD_KEYS[field.name] ?? field.name, field.label) : field.label,
    placeholder: field.placeholder
      ? t(
          PLACEHOLDER_KEYS[field.name] ??
            (field.name === 'customerNo' ? 'ag_fb_ph_customer_no' : field.name),
          field.placeholder,
        )
      : field.placeholder,
    hint: field.hint
      ? t(field.name === 'notes' ? 'ag_fb_hint_notes' : field.name, field.hint)
      : field.hint,
    rules: localizeRules(t, field.rules),
  };

  if (field.name === 'complaintType') {
    return {
      ...localized,
      options: AGENT_COMPLAINT_TYPES.map((type) => ({
        value: type,
        label: t(complaintTypeI18nKey(type), type),
      })),
    };
  }

  return localized;
}

/** Talep formu config yerelleştirme (etiketler + validasyon mesajları). */
export function localizeFeedbackFormConfig(base: FormConfig, t: TranslateFn): FormConfig {
  return {
    ...base,
    fields: base.fields?.map((f) => localizeField(t, f)),
    buttonToolbar: base.buttonToolbar
      ? {
          ...base.buttonToolbar,
          buttons: base.buttonToolbar.buttons.map((b) => ({
            ...b,
            label: t(BUTTON_KEYS[b.key] ?? b.key, b.label),
          })),
        }
      : base.buttonToolbar,
  };
}
