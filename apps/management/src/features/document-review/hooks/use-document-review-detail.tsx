import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { BackOfficeRole } from '@epay/ui';
import { documentReviewService } from '../api';
import type {
  ApprovePayload,
  RejectPayload,
  RequestAdditionalPayload,
  ReviewDocumentDetail,
} from '../domain/types';

export function useDocumentReviewDetail(role: BackOfficeRole) {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<ReviewDocumentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const reload = useCallback(() => {
    if (!documentId) return;
    const d = documentReviewService.getDocumentDetail(Number(documentId), role);
    if (!d) {
      setNotFound(true);
      setDetail(null);
    } else {
      setNotFound(false);
      setDetail(d);
    }
  }, [documentId, role]);

  useEffect(() => {
    setLoading(true);
    reload();
    setLoading(false);
  }, [reload]);

  const download = useCallback(() => {
    if (!documentId) return null;
    return documentReviewService.downloadDocument(Number(documentId));
  }, [documentId]);

  const approve = useCallback(
    (payload: ApprovePayload) => {
      if (!documentId) return { ok: false };
      const result = documentReviewService.approve(Number(documentId), role, payload);
      if (result.ok) navigate('/customers/documents/review');
      return result;
    },
    [documentId, role, navigate],
  );

  const reject = useCallback(
    (payload: RejectPayload) => {
      if (!documentId) return { ok: false };
      const result = documentReviewService.reject(Number(documentId), role, payload);
      if (result.ok) navigate('/customers/documents/review');
      return result;
    },
    [documentId, role, navigate],
  );

  const requestAdditional = useCallback(
    (payload: RequestAdditionalPayload) => {
      if (!documentId) return { ok: false };
      const result = documentReviewService.requestAdditional(Number(documentId), role, payload);
      if (result.ok) reload();
      return result;
    },
    [documentId, role, reload],
  );

  return {
    detail,
    loading,
    notFound,
    download,
    approve,
    reject,
    requestAdditional,
    goBack: () => navigate('/customers/documents/review'),
  };
}
