import { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useRole } from '@/domain/role-context';
import { fraudCasesService } from '../../api';
import { getFraudCasesPermissions } from '../../domain/permissions';
import {
  getCompliancePersona,
  type CompliancePersona,
} from '../domain/compliance-persona';
import { getCaseDetailPermissions } from '../domain/detail-permissions';
import type { CaseDecisionInput, CaseRouteInput } from '../domain/types';
import type { FraudExceptionInput } from '@/features/risk-compliance/fraud-rules/detail/domain/types';

export function useFraudCaseDetail() {
  const { caseId } = useParams();
  const { role } = useRole();
  const { t } = useTranslation();
  const [rev, setRev] = useState(0);
  const [persona, setPersona] = useState<CompliancePersona>(getCompliancePersona);

  const refresh = useCallback(() => setRev((v) => v + 1), []);

  const listPermissions = useMemo(() => getFraudCasesPermissions(role), [role]);

  const detail = useMemo(() => {
    void rev;
    if (!caseId) return null;
    return fraudCasesService.getDetail(caseId, role);
  }, [caseId, role, rev]);

  const permissions = useMemo(() => {
    if (!detail) {
      return getCaseDetailPermissions(persona, { isClosed: true, assignedToManager: false });
    }
    return getCaseDetailPermissions(persona, {
      isClosed: detail.header.isClosed,
      assignedToManager: detail.header.assignedToManager,
    });
  }, [detail, persona]);

  const runAction = useCallback(
    (fn: () => { ok: boolean; error?: string }, successKey: string) => {
      const r = fn();
      if (!r.ok) {
        toast.error(t(r.error ?? 'fcd_action_failed', r.error ?? ''));
        return false;
      }
      toast.success(t(successKey));
      refresh();
      return true;
    },
    [t, refresh],
  );

  const approve = useCallback(
    (input: CaseDecisionInput) => {
      if (!caseId) return;
      runAction(
        () => fraudCasesService.approve(caseId, input, role, persona),
        'fcd_approve_ok',
      );
    },
    [caseId, role, persona, runAction],
  );

  const reject = useCallback(
    (input: CaseDecisionInput) => {
      if (!caseId) return;
      runAction(
        () => fraudCasesService.reject(caseId, input, role, persona),
        'fcd_reject_ok',
      );
    },
    [caseId, role, persona, runAction],
  );

  const route = useCallback(
    (input: CaseRouteInput) => {
      if (!caseId) return;
      runAction(
        () => fraudCasesService.route(caseId, input, role, persona),
        'fcd_route_ok',
      );
    },
    [caseId, role, persona, runAction],
  );

  const addException = useCallback(
    (input: FraudExceptionInput) => {
      if (!caseId) return;
      runAction(
        () => fraudCasesService.addException(caseId, input, role, persona),
        'fcd_exception_ok',
      );
    },
    [caseId, role, persona, runAction],
  );

  const report = useCallback(
    (input: CaseDecisionInput) => {
      if (!caseId) return;
      runAction(
        () => fraudCasesService.report(caseId, input, role, persona),
        'fcd_report_ok',
      );
    },
    [caseId, role, persona, runAction],
  );

  return {
    caseId,
    detail,
    notFound: Boolean(caseId && listPermissions.viewDetail && !detail),
    listPermissions,
    permissions,
    persona,
    setPersona,
    approve,
    reject,
    route,
    addException,
    report,
  };
}
