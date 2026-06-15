import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useRole } from '@/domain/role-context';
import { riskScoresService } from '../api';
import type { FraudRiskSource, ManualChangeInput, RiskScoreDetail } from '../domain/types';

const SOURCES: FraudRiskSource[] = ['Customer', 'Agent', 'Transaction'];

function parseSource(raw: string | null): FraudRiskSource {
  if (raw && SOURCES.includes(raw as FraudRiskSource)) return raw as FraudRiskSource;
  return 'Customer';
}

export function useRiskScores() {
  const { t } = useTranslation();
  const { role } = useRole();
  const [searchParams, setSearchParams] = useSearchParams();

  const [source, setSource] = useState<FraudRiskSource>(() =>
    parseSource(searchParams.get('source')),
  );
  const [entityId, setEntityId] = useState(() => searchParams.get('id') ?? '');
  const [detail, setDetail] = useState<RiskScoreDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const search = useCallback(
    (nextSource?: FraudRiskSource, nextId?: string) => {
      const s = nextSource ?? source;
      const id = (nextId ?? entityId).trim();
      if (!id) {
        toast.error(t('rsc_id_required'));
        return;
      }

      setLoading(true);
      setNotFound(false);
      const params = new URLSearchParams();
      params.set('source', s);
      params.set('id', id);
      setSearchParams(params, { replace: true });

      const result = riskScoresService.getByEntityId(s, id, role);
      setLoading(false);
      if (!result) {
        setDetail(null);
        setNotFound(true);
        return;
      }
      setDetail(result);
      setNotFound(false);
    },
    [source, entityId, role, setSearchParams, t],
  );

  useEffect(() => {
    const id = searchParams.get('id');
    const s = parseSource(searchParams.get('source'));
    if (id) {
      setSource(s);
      setEntityId(id);
      setLoading(true);
      const result = riskScoresService.getByEntityId(s, id, role);
      setLoading(false);
      if (result) {
        setDetail(result);
        setNotFound(false);
      } else {
        setDetail(null);
        setNotFound(true);
      }
    }
  }, [searchParams, role]);

  const submitManualChange = (input: ManualChangeInput): boolean => {
    if (!detail) return false;
    setSubmitting(true);
    const result = riskScoresService.submitManualChange(detail.source, detail.entityId, input, role);
    setSubmitting(false);

    if (!result.ok) {
      toast.error(t(result.error ?? 'rsc_submit_failed'));
      return false;
    }

    toast.success(t('rsc_submitted'));
    search(detail.source, detail.entityId);
    return true;
  };

  const refresh = () => {
    if (detail) search(detail.source, detail.entityId);
  };

  return {
    source,
    setSource,
    entityId,
    setEntityId,
    detail,
    notFound,
    loading,
    submitting,
    search,
    submitManualChange,
    refresh,
  };
}
