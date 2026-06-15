import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { BackOfficeRole } from '@epay/ui';
import { getCurrentUser } from '../domain/current-user';
import type { ApprovalRequest } from '../domain/types';
import { approvalsService } from '../api';

export function useApprovalDetail(role: BackOfficeRole) {
  const { approvalId } = useParams<{ approvalId: string }>();
  const navigate = useNavigate();
  const user = useMemo(() => getCurrentUser(role), [role]);
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
