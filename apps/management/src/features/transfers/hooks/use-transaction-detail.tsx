import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useRole } from '@/domain/role-context';
import { correctionsService, transactionsService } from '../api';
import { getTransactionDetailPermissions } from '../domain/detail-permissions';
import { canCancel, canHold, canUnblock } from '../domain/transitions';
import type { InterventionResult, TransactionDetail } from '../domain/detail-types';

export function useTransactionDetail() {
  const { transactionId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { role } = useRole();
  const id = Number(transactionId);

  const isManualReview = searchParams.get('from') === 'manual';
  const correctionId = searchParams.get('correctionId');
  const returnTo = isManualReview
    ? correctionId
      ? `/transfers/manual?correctionId=${correctionId}`
      : '/transfers/manual'
    : '/transfers';

  const [detail, setDetail] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const permissions = useMemo(
    () => getTransactionDetailPermissions(role, isManualReview),
    [role, isManualReview],
  );

  const refresh = useCallback(async () => {
    if (!Number.isFinite(id)) {
      setNotFound(true);
      setDetail(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const d = await transactionsService.getDetail(id, role);
    setDetail(d);
    setNotFound(!d);
    setLoading(false);
  }, [id, role]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const runIntervention = async (result: Promise<InterventionResult>) => {
    const resolved = await result;
    if (resolved.ok) await refresh();
    return resolved;
  };

  const hold = (reason: string) => runIntervention(transactionsService.hold(id, reason, role));
  const unblock = (reason: string) => runIntervention(transactionsService.unblock(id, reason, role));
  const cancel = (reason: string) => runIntervention(transactionsService.cancel(id, reason, role));
  const submitApproval = async (): Promise<InterventionResult & { approvalId?: number }> => {
    if (detail?.transactionType === 'ManualCorrection') {
      const result = correctionsService.submitToApproval(id, role);
      if (result.ok) await refresh();
      return result;
    }
    return runIntervention(transactionsService.submitApproval(id, role));
  };

  const downloadDocument = (docId: number) => transactionsService.downloadDocument(docId, role);

  const isCorrectionDraft = detail?.transactionType === 'ManualCorrection';
  const showHold = Boolean(detail && permissions.hold && canHold(detail.status) && !isCorrectionDraft);
  const showUnblock = Boolean(detail && permissions.unblock && canUnblock(detail.status) && !isCorrectionDraft);
  const showCancel = Boolean(detail && permissions.cancel && canCancel(detail.status) && !isCorrectionDraft);
  const showSubmitApproval = Boolean(detail && permissions.submitApproval);
  const showApproveManual = Boolean(detail && permissions.approveManual);

  const goBack = () => navigate(returnTo);

  return {
    detail,
    loading,
    notFound,
    isManualReview,
    permissions,
    hold,
    unblock,
    cancel,
    submitApproval,
    downloadDocument,
    isCorrectionDraft,
    showHold,
    showUnblock,
    showCancel,
    showSubmitApproval,
    showApproveManual,
    goBack,
    returnTo,
    refresh,
  };
}
