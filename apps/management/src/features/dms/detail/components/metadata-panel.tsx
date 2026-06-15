import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { FormCard, FormGrid, Field } from '@epay/ui';
import { DocumentStatusPill } from '@/features/dms/components/document-status-pill';
import type { DmsDocumentDetail } from '../domain/types';

type Props = { detail: DmsDocumentDetail };

function ReadonlyValue({ children }: { children: ReactNode }) {
  return <div className="fs-12">{children}</div>;
}

export function MetadataPanel({ detail }: Props) {
  const { t, i18n } = useTranslation();
  const tr = i18n.language === 'tr';

  const fmtDate = (iso: string | null) =>
    iso
      ? new Date(iso).toLocaleString(tr ? 'tr-TR' : 'en-US', {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '—';

  const validity =
    detail.validFrom || detail.validUntil
      ? `${detail.validFrom ?? '…'} – ${detail.validUntil ?? '…'}`
      : '—';

  return (
    <FormCard title={t('dd_panel_metadata')}>
      <FormGrid>
        <Field label={t('dms_col_category')}>
          <ReadonlyValue>{t(`dr_cat_${detail.documentCategory}`, detail.documentCategory)}</ReadonlyValue>
        </Field>
        <Field label={t('dms_col_type')}>
          <ReadonlyValue>{detail.documentTypeName}</ReadonlyValue>
        </Field>
        <Field label={t('dms_col_created')}>
          <ReadonlyValue>{fmtDate(detail.createdAt)}</ReadonlyValue>
        </Field>
        <Field label={t('dms_col_created_by')}>
          <ReadonlyValue>{detail.createdBy}</ReadonlyValue>
        </Field>
        <Field label={t('scf_col_status')}>
          <DocumentStatusPill status={detail.documentStatus} />
        </Field>
        <Field label={t('dd_approval_status')}>
          <ReadonlyValue>{detail.approvalStatus ?? '—'}</ReadonlyValue>
        </Field>
        <Field label={t('dd_approved_at')}>
          <ReadonlyValue>{fmtDate(detail.approvedAt)}</ReadonlyValue>
        </Field>
        <Field label={t('dms_col_approved_by')}>
          <ReadonlyValue>{detail.approvedBy ?? '—'}</ReadonlyValue>
        </Field>
        <Field label={t('dd_approval_required')}>
          <input type="checkbox" checked={detail.approvalRequired} readOnly disabled />
        </Field>
        <Field label={t('dd_personal_data')}>
          <input type="checkbox" checked={detail.isPersonalData} readOnly disabled />
        </Field>
        <Field label={t('dd_active_retention')}>
          <ReadonlyValue>
            {detail.activeRetentionYears} {t('dd_years')}
          </ReadonlyValue>
        </Field>
        <Field label={t('dd_archive_retention')}>
          <ReadonlyValue>
            {detail.archiveRetentionYears} {t('dd_years')}
          </ReadonlyValue>
        </Field>
        <Field label={t('du_field_valid_from')}>
          <ReadonlyValue>{validity}</ReadonlyValue>
        </Field>
      </FormGrid>
    </FormCard>
  );
}
