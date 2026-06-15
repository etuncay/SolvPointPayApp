import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useRole } from '@/domain/role-context';
import { getScreenApprovalCount } from '@/features/system/approval-rules/domain/approval-rules-engine';
import { riskBasedLimitsService } from '../api';
import { createRiskLimitApprovalRequest } from '../api/risk-limit-approval-bridge';
import type { RiskBasedLimitRow, RiskLimitsCurrentPayload } from '../domain/types';

export function useRiskLimits() {
  const { t } = useTranslation();
  const { role } = useRole();
  const [payload, setPayload] = useState<RiskLimitsCurrentPayload | null>(null);
  const [rows, setRows] = useState<RiskBasedLimitRow[]>([]);
  const [asOf, setAsOf] = useState('');
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);

  const isHistorical = asOf.length > 0;

  const loadCurrent = useCallback(() => {
    setLoading(true);
    const data = riskBasedLimitsService.getCurrent();
    setPayload(data);
    setRows(data.rows.map((r) => ({ ...r })));
    setDirty(false);
    setLoading(false);
  }, []);

  const loadEffective = useCallback(
    (date: string) => {
      if (!date) {
        loadCurrent();
        return;
      }
      setLoading(true);
      const iso = `${date}T12:00:00Z`;
      const data = riskBasedLimitsService.getEffective(iso);
      setPayload(data);
      setRows(data.rows.map((r) => ({ ...r })));
      setDirty(false);
      setLoading(false);
    },
    [loadCurrent],
  );

  useEffect(() => {
    loadCurrent();
  }, [loadCurrent]);

  useEffect(() => {
    if (asOf) loadEffective(asOf);
    else loadCurrent();
  }, [asOf, loadEffective, loadCurrent]);

  const updateRow = (index: number, patch: Partial<RiskBasedLimitRow>) => {
    if (isHistorical) return;
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
    setDirty(true);
  };

  const saveVersion = useCallback((): {
    ok: boolean;
    direct?: boolean;
    approvalId?: number;
    error?: string;
  } => {
    const needsApproval = getScreenApprovalCount('risk.limits') > 0;
    if (!needsApproval) {
      try {
        const saved = riskBasedLimitsService.saveVersion(rows);
        setPayload(saved);
        setRows(saved.rows.map((r) => ({ ...r })));
        setDirty(false);
        setAsOf('');
        toast.success(t('rl_saved_version'));
        return { ok: true, direct: true };
      } catch (e) {
        const code = e instanceof Error ? e.message : 'rl_save_failed';
        toast.error(t(code, code));
        return { ok: false, error: code };
      }
    }

    if (!payload) return { ok: false, error: 'rl_save_failed' };
    const result = createRiskLimitApprovalRequest({
      rows,
      oldRows: payload.rows,
      role,
    });
    if (!result.ok) {
      toast.error(t(result.error ?? 'rl_save_failed'));
      return result;
    }
    setDirty(false);
    return result;
  }, [payload, rows, role, t]);

  const discard = () => {
    if (payload) {
      setRows(payload.rows.map((r) => ({ ...r })));
      setDirty(false);
    }
  };

  const currentVersionId = useMemo(() => payload?.versionId ?? '', [payload]);

  return {
    rows,
    payload,
    loading,
    dirty,
    asOf,
    setAsOf,
    isHistorical,
    updateRow,
    saveVersion,
    discard,
    reload: loadCurrent,
    currentVersionId,
  };
}
