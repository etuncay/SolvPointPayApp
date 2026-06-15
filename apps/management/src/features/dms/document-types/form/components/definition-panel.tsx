import { useTranslation } from 'react-i18next';
import type { UseFormReturn } from 'react-hook-form';
import { Field, FormCard, FormGrid } from '@epay/ui';
import { DOCUMENT_CATEGORIES } from '@/features/document-review/domain/types';
import { DEFAULT_MAX_FILE_SIZE_MB } from '@/mocks/document-upload-params';
import type { DocumentTypeFormValues } from '../domain/form-types';

type Props = {
  form: UseFormReturn<DocumentTypeFormValues>;
  isEdit: boolean;
  disabled?: boolean;
};

export function DefinitionPanel({ form, isEdit, disabled }: Props) {
  const { t } = useTranslation();
  const { register, watch } = form;
  const code = watch('documentTypeCode');

  return (
    <FormCard title={t('dtf_panel_definition')}>
      <FormGrid cols={2}>
        <Field label={t('dms_col_category')} required>
          <select
            className="select"
            disabled={disabled}
            {...register('documentCategory', { required: true })}
          >
            <option value="">{t('du_select_category')}</option>
            {DOCUMENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t(`dr_cat_${c}`, c)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t('dms_col_type')} required>
          <input
            className="input"
            disabled={disabled}
            {...register('name', { required: true })}
            placeholder={t('dtf_name_ph')}
          />
        </Field>
        {isEdit ? (
          <Field label={t('dtf_type_code')}>
            <input className="input mono" readOnly value={code} disabled />
          </Field>
        ) : null}
        <Field label={t('rpt_col_desc')}>
          <textarea
            className="input"
            rows={3}
            disabled={disabled}
            {...register('description')}
          />
        </Field>
        <Field label={t('dt_col_active_retention')} required>
          <input
            type="number"
            min={1}
            className="input"
            disabled={disabled}
            {...register('activeRetentionYears', { valueAsNumber: true })}
          />
        </Field>
        <Field label={t('dt_col_archive_retention')} required>
          <input
            type="number"
            min={1}
            className="input"
            disabled={disabled}
            {...register('archiveRetentionYears', { valueAsNumber: true })}
          />
        </Field>
        <Field
          label={t('dt_col_max_size')}
          hint={t('dtf_max_size_hint', { mb: DEFAULT_MAX_FILE_SIZE_MB })}
        >
          <input
            type="number"
            min={1}
            className="input"
            disabled={disabled}
            placeholder={t('dtf_max_size_ph')}
            {...register('maxFileSizeMb')}
          />
        </Field>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8 }}>
          <label className="check-row">
            <input type="checkbox" disabled={disabled} {...register('isPersonalData')} />
            <span>{t('dd_personal_data')}</span>
          </label>
          <label className="check-row">
            <input type="checkbox" disabled={disabled} {...register('approvalRequired')} />
            <span>{t('dd_approval_required')}</span>
          </label>
        </div>
      </FormGrid>
    </FormCard>
  );
}
