import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { ApprovalRequest } from '../domain/types';
import { approvalsService } from '../api';
import { useApprovalCurrentUser } from './use-approval-current-user';

export function useApprovalDetail() {
  const { approvalId } = useParams<{ approvalId: string }>();
  const navigate = useNavigate();
  const user = useApprovalCurrentUser();
  const [detail, setDetail] = useState<ApprovalRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const reload = useCallback(() => {
    if (!approvalId) return;
    const d = approvalsService.getById(Number(approvalId));
    if (!d) {
      setNotFound(true);
      setDetail(null);
    } else {
      setNotFound(false);
      setDetail(d);
    }
  }, [approvalId]);

  useEffect(() => {
    setLoading(true);
    reload();
    setLoading(false);
  }, [reload]);

  const approve = useCallback(
    (comment?: string) => {
      if (!approvalId) return { ok: false };
      const result = approvalsService.approve(Number(approvalId), user, comment);
      if (result.ok) navigate('/approvals');
      return result;
    },
    [approvalId, user, navigate],
  );

  const reject = useCallback(
    (comment: string) => {
      if (!approvalId) return { ok: false };
      const result = approvalsService.reject(Number(approvalId), user, comment);
      if (result.ok) navigate('/approvals');
      return result;
    },
    [approvalId, user, navigate],
  );

  const withdraw = useCallback(() => {
    if (!approvalId) return { ok: false };
    const result = approvalsService.withdraw(Number(approvalId), user);
    if (result.ok) reload();
    return result;
  }, [approvalId, user, reload]);

  const resubmit = useCallback(() => {
    if (!approvalId) return { ok: false };
    const result = approvalsService.resubmit(Number(approvalId), user);
    if (result.ok && result.id) navigate(`/approvals/${result.id}`);
    return result;
  }, [approvalId, user, navigate]);

  return {
    user,
    detail,
    loading,
    notFound,
    approve,
    reject,
    withdraw,
    resubmit,
    reload,
    goBack: () => navigate('/approvals'),
  };
}
