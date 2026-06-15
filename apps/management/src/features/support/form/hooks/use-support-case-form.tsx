import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getCurrentUser } from '@/features/approval-pool/domain/current-user';
import { useRole } from '@/domain/role-context';
import { supportCasesService } from '../../api/mock-support-cases-adapter';
import { getSupportCasePermissions } from '../../domain/permissions';
import type { SupportCaseDetail, SupportCaseFormValues } from '../../domain/types';
import { EMPTY_SUPPORT_CASE_FORM } from '../../domain/types';
import {
  canPerformCaseAction,
  visibleActionButtons,
} from '../domain/form-permissions';
import { validateCreateForm } from '../domain/validation';
import type { ActionKind } from '../domain/transitions';
import type { CaseStatus } from '../../domain/types';
import type { SupportCasePostActionInput } from '../../api/support-cases-service';

export function useSupportCaseForm() {
  const { role } = useRole();
  const navigate = useNavigate();
  const location = useLocation();
  const { caseId: caseIdParam } = useParams<{ caseId: string }>();
  const [searchParams] = useSearchParams();
  const isNew = location.pathname.endsWith('/new');
  const caseId = isNew ? null : Number(caseIdParam);
  const user = useMemo(() => getCurrentUser(role), [role]);
  const perms = getSupportCasePermissions(role);

  const form = useForm<SupportCaseFormValues>({ defaultValues: EMPTY_SUPPORT_CASE_FORM });
  const [detail, setDetail] = useState<SupportCaseDetail | null>(null);
  const [loading, setLoading] = useState(!isNew);

  const isReconciliationLocked =
    detail?.source === 'reconciliation' || searchParams.get('from') === 'reconciliation';

  useEffect(() => {
    if (isNew) {
      setLoading(false);
      setDetail(null);
      form.reset(EMPTY_SUPPORT_CASE_FORM);
      return;
    }
    if (!Number.isFinite(caseId)) {
      setLoading(false);
      return;
    }
    const d = supportCasesService.getDetail(role, user.id, caseId!);
    setDetail(d);
    setLoading(false);
    if (d) {
      form.reset({
        requesterType: d.requesterType,
        requesterId: d.requesterId,
        subject: d.subject,
        complaintType: d.complaintType,
        ownerUserId: d.ownerUserId ?? '',
        departmentId: d.departmentId ?? '',
        urgency: d.urgency,
        criticality: d.criticality,
        detail: d.detail,
      });
    }
  }, [isNew, caseId, role, user.id, form]);

  const refresh = () => {
    if (!caseId) return;
    setDetail(supportCasesService.getDetail(role, user.id, caseId));
  };

  const canAct = detail ? canPerformCaseAction(role, user.id, detail) : perms.insert;
  const buttons = visibleActionButtons(
    isNew ? 'new' : 'edit',
    detail?.caseStatus ?? null,
    { insert: perms.insert, canAct },
    isReconciliationLocked,
  );

  const saveCreate = () => {
    const v = validateCreateForm(form.getValues());
    if (!v.ok) return v;
    const result = supportCasesService.create(role, user.id, user.displayName, form.getValues());
    if (!result.ok) return result;
    navigate(`/support/cases/${result.id}`);
    return result;
  };

  const runAction = (kind: ActionKind, payload: Record<string, string>) => {
    if (!caseId) return { ok: false as const, error: 'scf_not_found' };
    const actionInput: SupportCasePostActionInput = {
      kind,
      note: payload.note ?? '',
      ownerUserId: payload.ownerUserId,
      departmentId: payload.departmentId,
      contactedParty: payload.contactedParty as SupportCasePostActionInput['contactedParty'],
      channel: payload.channel,
      reopenReason: payload.reopenReason,
    };
    if (payload.resolutionCode) {
      actionInput.resolutionCode = payload.resolutionCode as CaseStatus;
    }
    const result = supportCasesService.postAction(role, user.id, user.displayName, caseId, actionInput);
    if (result.ok) refresh();
    return result;
  };

  const attachDocument = (documentId: string) => {
    if (!caseId) return;
    supportCasesService.attachDocument(caseId, documentId);
    refresh();
  };

  return {
    form,
    isNew,
    caseId,
    detail,
    loading,
    notFound: !isNew && !loading && !detail,
    perms,
    canAct,
    buttons,
    isReconciliationLocked,
    user,
    saveCreate,
    runAction,
    attachDocument,
    cancel: () => navigate('/support/cases'),
    previewCaseNo: isNew ? 'SC-2026-•••••' : detail?.caseNo,
  };
}
