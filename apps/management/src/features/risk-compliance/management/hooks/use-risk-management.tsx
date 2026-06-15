import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRole } from '@/domain/role-context';
import { riskManagementService } from '../api';
import {
  createRiskManagementApprovalRequest,
  type RiskManagementApprovalPayload,
} from '../api/risk-management-approval-bridge';
import { getRiskManagementPermissions } from '../domain/permissions';
import type {
  CaseGroup,
  CaseRoutingRule,
  FraudEngineParams,
  OccupationThreshold,
  ReferenceListCode,
  ReferenceListItem,
} from '../domain/types';
import { REFERENCE_LIST_CODES } from '../domain/types';

export function useRiskManagement() {
  const { role } = useRole();
  const permissions = useMemo(() => getRiskManagementPermissions(role), [role]);
  const [rev, setRev] = useState(0);
  const refresh = useCallback(() => setRev((v) => v + 1), []);

  const snapshot = useMemo(() => {
    void rev;
    if (!permissions.view) return null;
    return {
      refs: riskManagementService.getReferenceLists(role),
      groups: riskManagementService.getGroups(role),
      routing: riskManagementService.getRoutingRules(role),
      params: riskManagementService.getParams(role),
    };
  }, [role, permissions.view, rev]);

  const [selectedList, setSelectedList] = useState<ReferenceListCode>('RiskyCountries');
  const [activeValues, setActiveValues] = useState<string[]>([]);
  const [occupationRows, setOccupationRows] = useState<OccupationThreshold[]>([]);
  const [groups, setGroups] = useState<CaseGroup[]>([]);
  const [rules, setRules] = useState<CaseRoutingRule[]>([]);
  const [params, setParams] = useState<FraudEngineParams>({ fraud_engine_timeout_ms: '-1' });
  const [dirty, setDirty] = useState(false);
  const [baseline, setBaseline] = useState<RiskManagementApprovalPayload | null>(null);

  useEffect(() => {
    if (!snapshot) return;
    setOccupationRows(snapshot.refs.occupationThresholds.map((o) => ({ ...o })));
    setGroups(snapshot.groups.groups.map((g) => ({ ...g, memberIds: [...g.memberIds] })));
    setRules(snapshot.routing.rules.map((r) => ({ ...r })));
    setParams({ ...snapshot.params });
    setDirty(false);
    setBaseline({
      refPayload: {
        items: snapshot.refs.items.map((i) => ({ ...i })),
        occupationThresholds: snapshot.refs.occupationThresholds.map((o) => ({ ...o })),
      },
      groups: snapshot.groups.groups.map((g) => ({ ...g, memberIds: [...g.memberIds] })),
      rules: snapshot.routing.rules.map((r) => ({ ...r })),
      params: { ...snapshot.params },
    });
  }, [snapshot]);

  useEffect(() => {
    if (!snapshot) return;
    const active = snapshot.refs.items
      .filter((i) => i.listCode === selectedList && !i.effectiveTo)
      .map((i) => i.value);
    setActiveValues(active);
  }, [snapshot, selectedList]);

  const historyItems = useMemo((): ReferenceListItem[] => {
    if (!snapshot) return [];
    return snapshot.refs.items.filter((i) => i.listCode === selectedList && i.effectiveTo);
  }, [snapshot, selectedList]);

  const addValue = (value: string) => {
    const v = value.trim();
    if (!v || activeValues.includes(v)) return;
    setActiveValues((prev) => [...prev, v]);
    setDirty(true);
  };

  const removeValue = (value: string) => {
    setActiveValues((prev) => prev.filter((x) => x !== value));
    setDirty(true);
  };

  const buildReferencePayload = useCallback(() => {
    if (!snapshot) return null;
    const historical = snapshot.refs.items.filter((i) => i.effectiveTo);
    const otherActive = snapshot.refs.items.filter(
      (i) => !i.effectiveTo && i.listCode !== selectedList,
    );
    const newActive: ReferenceListItem[] = activeValues.map((value) => ({
      id: `draft-${value}`,
      listCode: selectedList,
      value,
      sourceTag: 'manual',
      effectiveFrom: new Date().toISOString(),
      effectiveTo: null,
    }));
    return {
      items: [...historical, ...otherActive, ...newActive],
      occupationThresholds: occupationRows,
    };
  }, [snapshot, selectedList, activeValues, occupationRows]);

  const buildCurrentPayload = useCallback((): RiskManagementApprovalPayload | null => {
    const refPayload = buildReferencePayload();
    if (!refPayload) return null;
    return {
      refPayload,
      groups: groups.map((g) => ({ ...g, memberIds: [...g.memberIds] })),
      rules: rules.map((r) => ({ ...r })),
      params: { ...params },
    };
  }, [buildReferencePayload, groups, rules, params]);

  const saveAll = useCallback(() => {
    const current = buildCurrentPayload();
    if (!current || !baseline) return { ok: false, error: 'rm_forbidden' };
    return createRiskManagementApprovalRequest({
      payload: current,
      oldSnapshot: baseline,
      role,
    });
  }, [baseline, buildCurrentPayload, role]);

  return {
    permissions,
    referenceListCodes: REFERENCE_LIST_CODES,
    selectedList,
    setSelectedList,
    activeValues,
    addValue,
    removeValue,
    historyItems,
    occupationRows,
    setOccupationRows: (rows: OccupationThreshold[]) => {
      setOccupationRows(rows);
      setDirty(true);
    },
    groups,
    setGroups: (next: CaseGroup[]) => {
      setGroups(next);
      setDirty(true);
    },
    rules,
    setRules: (next: CaseRoutingRule[]) => {
      setRules(next);
      setDirty(true);
    },
    params,
    setParams: (next: FraudEngineParams) => {
      setParams(next);
      setDirty(true);
    },
    dirty,
    saveAll,
    assignableGroups: useMemo(() => {
      void rev;
      return permissions.view ? riskManagementService.listAssignableGroups(role) : [];
    }, [permissions.view, role, rev]),
  };
}
