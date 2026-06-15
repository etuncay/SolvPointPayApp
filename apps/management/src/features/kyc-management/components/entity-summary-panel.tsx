import { useTranslation } from 'react-i18next';
import { User } from 'lucide-react';
import { Field, FormCard, FormGrid } from '@epay/ui';
import type { KycReview } from '../domain/types';

type Props = { review: KycReview };

export function EntitySummaryPanel({ review }: Props) {
  const { t, i18n } = useTranslation();
  const tr = i18n.language === 'tr';

  return (
    <FormCard title={t('kyc_panel_entity')} icon={<User size={13} />}>
      <FormGrid>
        <Field label={t('kyc_col_entity_no')} locked>
          <input className="input mono locked" readOnly value={review.entityNo} />
        </Field>
        <Field label={t('kyc_col_type')} locked>
          <input className="input locked" readOnly value={review.entityTypeFull} />
        </Field>
        <Field label={t('kyc_col_id_type')} locked>
          <input className="input locked" readOnly value={review.identityDocumentExtended} />
        </Field>
        <Field label={t('fcd_customer_id_no')} locked>
          <input className="input mono locked" readOnly value={review.identityNo} />
        </Field>
        <Field label={t('kyc_col_name')} locked>
          <input className="input locked" readOnly value={review.displayName} />
        </Field>
        <Field label={t('fcd_customer_phone')} locked>
          <input className="input locked" readOnly value={review.phone} />
        </Field>
        <Field label={t('fcd_customer_email')} locked>
          <input className="input locked" readOnly value={review.email} />
        </Field>
        <Field label={t('kyc_col_birth')} locked>
          <input className="input mono locked" readOnly value={review.birthDate ?? '—'} />
        </Field>
        <Field label={t('kyc_col_blockage')} locked>
          <input className="input locked" readOnly value={review.blockageReason ?? '—'} />
        </Field>
        <Field label={t('kyc_col_kyc_status')} locked>
          <input className="input locked" readOnly value={review.kycStatusDisplay} />
        </Field>
        <Field label={tr ? 'Entity durumu' : 'Entity status'} locked>
          <input className="input locked" readOnly value={review.entityStatus} />
        </Field>
      </FormGrid>
    </FormCard>
  );
}
