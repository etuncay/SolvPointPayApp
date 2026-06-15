import { useTranslation } from 'react-i18next';
import { Button } from '@epay/ui';
import type { BackOfficeRole } from '@epay/ui';
import { canActOnReview, getKycPermissions, showVerifyFinalize } from '../domain/permissions';
import type { KycReview } from '../domain/types';

type Props = {
  review: KycReview;
  role: BackOfficeRole;
  onFalsePositive: () => void;
  onRequestAdditional: () => void;
  onReject: () => void;
  onVerify: () => void;
  onFinalizeVerify: () => void;
  onAddDocument: () => void;
};

export function KycActionBar({
  review,
  role,
  onFalsePositive,
  onRequestAdditional,
  onReject,
  onVerify,
  onFinalizeVerify,
  onAddDocument,
}: Props) {
  const { t } = useTranslation();
  const p = getKycPermissions(role);
  const canAct = canActOnReview(review);
  const showFinalize = showVerifyFinalize(review, role);

  if (!p.detail) return null;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
      {p.falsePositive && canAct && (
        <Button type="button" onClick={onFalsePositive}>
          {t('fr_col_fp')}
        </Button>
      )}
      {p.requestAdditional && canAct && (
        <Button type="button" onClick={onRequestAdditional}>
          {t('kyc_action_request')}
        </Button>
      )}
      {p.reject && canAct && (
        <Button type="button" variant="danger" onClick={onReject}>
          {t('scf_btn_reject')}
        </Button>
      )}
      {p.verifySubmit && canAct && (
        <Button type="button" variant="primary" onClick={onVerify}>
          {t('kyc_action_verify')}
        </Button>
      )}
      {showFinalize && (
        <Button type="button" variant="primary" onClick={onFinalizeVerify}>
          {t('kyc_action_verify_finalize')}
        </Button>
      )}
      {p.addDocument && (
        <Button type="button" variant="ghost" onClick={onAddDocument}>
          {t('kyc_action_add_doc')}
        </Button>
      )}
    </div>
  );
}
