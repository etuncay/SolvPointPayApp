import { useCallback, useMemo, useState } from 'react';
import type { BackOfficeRole } from '@epay/ui';
import { approvalRulesService } from '../api/mock-approval-rules-adapter';
import type {
  ApprovalCount,
  ApproverAvailabilityIssue,
  FieldApprovalRule,
  FieldApprovalRuleInput,
  ScreenApprovalRule,
} from '../domain/types';

export function useApprovalRules(role: BackOfficeRole) {
  const [rev, setRev] = useState(0);
  const bump = useCallback(() => setRev((v) => v + 1), []);

  const screens = useMemo(
    () => approvalRulesService.listScreens(role),
    [role, rev],
  );
  const fields = useMemo(
    () => approvalRulesService.listFields(role),
    [role, rev],
  );

  const [screenDraft, setScreenDraft] = useState<Record<string, ApprovalCount>>({});
  const [fieldEditingId, setFieldEditingId] = useState<string | 'new' | null>(null);
  const [fieldDraft, setFieldDraft] = useState<FieldApprovalRuleInput | null>(null);
  const [blockIssues, setBlockIssues] = useState<ApproverAvailabilityIssue[]>([]);

  const initScreenDraft = useCallback((rows: ScreenApprovalRule[]) => {
    setScreenDraft(Object.fromEntries(rows.map((r) => [r.id, r.approvalCount])));
  }, []);

  const patchScreenCount = useCallback((id: string, count: ApprovalCount) => {
    setScreenDraft((prev) => ({ ...prev, [id]: count }));
  }, []);

  const screenChanges = useMemo(() => {
    return screens
      .filter((r) => screenDraft[r.id] !== undefined && screenDraft[r.id] !== r.approvalCount)
      .map((r) => ({ id: r.id, approvalCount: screenDraft[r.id]! }));
  }, [screens, screenDraft]);

  const saveScreens = useCallback(() => {
    const result = approvalRulesService.saveScreens(role, screenChanges);
    if (!result.ok) {
      if (result.errorCode === 'ar_screen_save_blocked') {
        setBlockIssues(result.issues);
      }
      return result;
    }
    setBlockIssues([]);
    bump();
    initScreenDraft(approvalRulesService.listScreens(role));
    return result;
  }, [role, screenChanges, bump, initScreenDraft]);

  const startNewField = useCallback(() => {
    setFieldEditingId('new');
    setFieldDraft({
      operationName: '',
      screenId: 'customers.fees',
      fieldName: '',
      specialCondition: null,
      scope: 'FieldChanges',
      approvalCount: 0,
      noApprovalLimit: null,
      oneApprovalLimit: null,
    });
  }, []);

  const startEditField = useCallback((row: FieldApprovalRule) => {
    setFieldEditingId(row.id);
    setFieldDraft({
      operationName: row.operationName,
      screenId: row.screenId,
      fieldName: row.fieldName,
      specialCondition: row.specialCondition,
      scope: row.scope,
      approvalCount: row.approvalCount,
      noApprovalLimit: row.noApprovalLimit,
      oneApprovalLimit: row.oneApprovalLimit,
    });
  }, []);

  const cancelFieldEdit = useCallback(() => {
    setFieldEditingId(null);
    setFieldDraft(null);
  }, []);

  const patchFieldDraft = useCallback((patch: Partial<FieldApprovalRuleInput>) => {
    setFieldDraft((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const saveField = useCallback(() => {
    if (!fieldDraft) return { ok: false as const, errorCode: 'ar_draft_empty' };
    const result =
      fieldEditingId === 'new'
        ? approvalRulesService.createField(role, fieldDraft)
        : fieldEditingId
          ? approvalRulesService.updateField(role, fieldEditingId, fieldDraft)
          : { ok: false as const, errorCode: 'frd_not_found' };
    if (result.ok) {
      bump();
      cancelFieldEdit();
    }
    return result;
  }, [role, fieldDraft, fieldEditingId, bump, cancelFieldEdit]);

  const deleteField = useCallback(
    (id: string) => {
      const result = approvalRulesService.deleteField(role, id);
      if (result.ok) bump();
      return result;
    },
    [role, bump],
  );

  const validateField = useCallback(
    (screenId: string, fieldName: string, specialCondition?: string | null) =>
      approvalRulesService.validateFieldRule({ screenId, fieldName, specialCondition }),
    [],
  );

  return {
    screens,
    fields,
    screenDraft,
    initScreenDraft,
    patchFieldDraft,
    patchScreenCount,
    screenDirty: screenChanges.length > 0,
    saveScreens,
    blockIssues,
    clearBlockIssues: () => setBlockIssues([]),
    fieldEditingId,
    fieldDraft,
    startNewField,
    startEditField,
    cancelFieldEdit,
    saveField,
    deleteField,
    validateField,
    bump,
  };
}
