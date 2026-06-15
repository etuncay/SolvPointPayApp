import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useRole } from '@/domain/role-context';
import { getHrCurrentUserExtras } from '@/domain/hr-persona';
import { getHrLeaveParams } from '@/features/hr/leaves/domain/hr-leave-params';
import { leaveDetailService } from '../api/mock-leave-detail-adapter';
import { computeWorkingDays } from '../domain/compute-working-days';
import {
  canAccessLeaveForm,
  canSubmitLeaveForm,
  resolveLeaveFormMode,
} from '../domain/permissions';
import type { LeaveFormMode, LeaveFormValues } from '../domain/types';

function emptyValues(): LeaveFormValues {
  return {
    leaveType: 'AnnualLeave',
    startDate: '',
    endDate: '',
    notes: '',
    cancelFull: false,
  };
}

function detailToValues(detail: {
  leaveType: LeaveFormValues['leaveType'];
  startDate: string;
  endDate: string;
  notes: string | null;
}): LeaveFormValues {
  return {
    leaveType: detail.leaveType,
    startDate: detail.startDate,
    endDate: detail.endDate,
    notes: detail.notes ?? '',
    cancelFull: false,
  };
}

export function useLeaveForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role } = useRole();
  const extras = getHrCurrentUserExtras(role);
  const { leaveId } = useParams<{ leaveId: string }>();
  const [searchParams] = useSearchParams();
  const viewOnly = searchParams.get('view') === '1';
  const isNew = !leaveId;

  const [loading, setLoading] = useState(!isNew);
  const [notFound, setNotFound] = useState(false);
  const [detail, setDetail] = useState<ReturnType<typeof leaveDetailService.getById>>(null);

  const form = useForm<LeaveFormValues>({ defaultValues: emptyValues() });
  const { register, watch, reset, handleSubmit } = form;
  const values = watch();

  const mode: LeaveFormMode | null = useMemo(() => {
    if (isNew) return 'create';
    if (!detail) return null;
    return resolveLeaveFormMode(detail, viewOnly, extras.employeeId);
  }, [isNew, detail, viewOnly, extras.employeeId]);

  const canAccess = canAccessLeaveForm(extras, mode);
  const canSubmit = mode != null && canSubmitLeaveForm(mode);

  const holidays = getHrLeaveParams().publicHolidays;
  const workingDays = useMemo(
    () =>
      values.cancelFull && mode === 'cancel'
        ? 0
        : computeWorkingDays(values.startDate, values.endDate, holidays),
    [values.startDate, values.endDate, values.cancelFull, mode, holidays],
  );

  useEffect(() => {
    if (isNew) {
      setLoading(false);
      reset(emptyValues());
      return;
    }
    setLoading(true);
    const row = leaveDetailService.getById(leaveId!);
    if (!row) {
      setNotFound(true);
      setDetail(null);
    } else {
      setNotFound(false);
      setDetail(row);
      reset(detailToValues(row));
    }
    setLoading(false);
  }, [isNew, leaveId, reset]);

  const onCancel = useCallback(() => navigate('/hr/leave'), [navigate]);

  const onSubmit = handleSubmit((data) => {
    if (!canSubmit || !extras.employeeId || !mode) return;
    const result =
      mode === 'create'
        ? leaveDetailService.create(data, role, extras.employeeId)
        : leaveDetailService.submitCancel(leaveId!, data, role, extras.employeeId);

    if (!result.ok) {
      toast.error(t(result.errorCode, result.errorCode));
      return;
    }
    toast.success(t('lf_submit_ok'));
    navigate(`/approvals/${result.approvalId}`);
  });

  const goToApproval = useCallback(() => {
    if (detail?.approvalRequestId) navigate(`/approvals/${detail.approvalRequestId}`);
  }, [detail, navigate]);

  return {
    mode,
    canAccess,
    canSubmit,
    loading,
    notFound,
    detail,
    isView: mode === 'view',
    isCancel: mode === 'cancel',
    isCreate: mode === 'create',
    register,
    watch,
    workingDays,
    onCancel,
    onSubmit,
    goToApproval,
    approvalId: detail?.approvalRequestId ?? null,
  };
}
