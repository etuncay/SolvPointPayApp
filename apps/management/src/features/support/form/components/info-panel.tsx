import { useTranslation } from 'react-i18next';
import type { UseFormReturn } from 'react-hook-form';
import { Field, FormCard, FormGrid } from '@epay/ui';
import type { SupportCaseFormValues } from '../../domain/types';
import { DEPARTMENT_OPTIONS } from '../mocks/departments';
import { STAFF_OPTIONS } from '../mocks/staff';
import { LEVEL_OPTIONS } from '../domain/transitions';

type Props = {
  form: UseFormReturn<SupportCaseFormValues>;
  readonly: boolean;
  caseNo?: string;
};

export function InfoPanel({ form, readonly, caseNo }: Props) {
  const { t } = useTranslation();
  const { register } = form;

  return (
    <FormCard title={t('scf_panel_info')}>
      <FormGrid cols={2}>
        {caseNo ? (
          <Field label={t('scf_case_no')}>
            <input className="input mono" readOnly value={caseNo} />
          </Field>
        ) : null}
        <Field label={t('scf_requester_type')} required={!readonly}>
          <select className="select" disabled={readonly} {...register('requesterType', { required: true })}>
            <option value="">{t('scf_select')}</option>
            <option value="Customer">{t('scf_entity_customer')}</option>
            <option value="Agent">{t('rpt_col_agent')}</option>
            <option value="ThirdParty">{t('scf_entity_third')}</option>
          </select>
        </Field>
        <Field label={t('scf_requester_id')} required={!readonly}>
          <input className="input" disabled={readonly} {...register('requesterId')} />
        </Field>
        <Field label={t('sc_col_subject')} required={!readonly} col={2}>
          <input className="input" disabled={readonly} {...register('subject')} />
        </Field>
        <Field label={t('scf_complaint_type')} required={!readonly}>
          <select className="select" disabled={readonly} {...register('complaintType', { required: true })}>
            <option value="">{t('scf_select')}</option>
            <option value="General">{t('complaint_type_General')}</option>
            <option value="Technical">{t('complaint_type_Technical')}</option>
            <option value="Billing">{t('complaint_type_Billing')}</option>
            <option value="ReconciliationDiscrepancy">{t('complaint_type_ReconciliationDiscrepancy')}</option>
          </select>
        </Field>
        <Field label={t('scf_owner')}>
          <select className="select" disabled={readonly} {...register('ownerUserId')}>
            <option value="">{t('scf_none')}</option>
            {STAFF_OPTIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t('scf_department')}>
          <select className="select" disabled={readonly} {...register('departmentId')}>
            <option value="">{t('scf_none')}</option>
            {DEPARTMENT_OPTIONS.map((d) => (
              <option key={d.id} value={d.id}>
                {t(d.nameKey)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t('scf_urgency')}>
          <select className="select" disabled={readonly} {...register('urgency')}>
            {LEVEL_OPTIONS.map((l) => (
              <option key={l} value={l}>
                {t(`scf_level_${l}`)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t('scf_criticality')}>
          <select className="select" disabled={readonly} {...register('criticality')}>
            {LEVEL_OPTIONS.map((l) => (
              <option key={l} value={l}>
                {t(`scf_level_${l}`)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t('scf_detail')} col={2}>
          <textarea className="input" rows={4} disabled={readonly} {...register('detail')} />
        </Field>
      </FormGrid>
      <p className="fs-11 t-mute" style={{ marginTop: 8 }}>
        {t('scf_level_hint')}
      </p>
    </FormCard>
  );
}
