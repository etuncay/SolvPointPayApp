import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import type { BackOfficeRole } from '@epay/ui';
import { kycReviewsService } from '../api';
import type {
  KycDocumentInput,
  KycNoteInput,
  KycReviewDetail,
  KycVerifyInput,
} from '../domain/types';

export function useKycReviewDetail(role: BackOfficeRole) {
  const { reviewId } = useParams<{ reviewId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = reviewId ? Number(reviewId) : NaN;
  const [detail, setDetail] = useState<KycReviewDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const reload = useCallback(() => {
    if (!reviewId || Number.isNaN(id)) return;
    const d = kycReviewsService.getById(id, role);
    if (!d) {
      setNotFound(true);
      setDetail(null);
    } else {
      setNotFound(false);
      setDetail(d);
    }
  }, [id, reviewId, role]);

  useEffect(() => {
    setLoading(true);
    reload();
    setLoading(false);
  }, [reload]);

  const runAction = useCallback(
    (fn: () => { ok: boolean; error?: string; approvalId?: number }) => {
      const result = fn();
      if (result.ok) reload();
      return result;
    },
    [reload],
  );

  const falsePositive = useCallback(
    (input: KycNoteInput) => runAction(() => kycReviewsService.falsePositive(id, input, role)),
    [id, role, runAction],
  );

  const requestAdditional = useCallback(
    (input: KycNoteInput) => runAction(() => kycReviewsService.requestAdditional(id, input, role)),
    [id, role, runAction],
  );

  const reject = useCallback(
    (input: KycNoteInput) => runAction(() => kycReviewsService.reject(id, input, role)),
    [id, role, runAction],
  );

  const verify = useCallback(
    (input: KycVerifyInput) => runAction(() => kycReviewsService.verify(id, input, role)),
    [id, role, runAction],
  );

  const finalizeVerify = useCallback(
    () => runAction(() => kycReviewsService.finalizeVerify(id, role)),
    [id, role, runAction],
  );

  const addDocument = useCallback(
    (input: KycDocumentInput) => runAction(() => kycReviewsService.addDocument(id, input, role)),
    [id, role, runAction],
  );

  const wantsVerifyApprove = searchParams.get('approve') === 'verify';

  return {
    detail,
    loading,
    notFound,
    falsePositive,
    requestAdditional,
    reject,
    verify,
    finalizeVerify,
    addDocument,
    reload,
    wantsVerifyApprove,
    goBack: () => navigate('/ops/kyc'),
  };
}
