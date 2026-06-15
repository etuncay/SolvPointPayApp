import { useCallback, useEffect, useMemo, useState } from 'react';
import type { BackOfficeRole } from '@epay/ui';
import { integrationsService } from '../api/mock-integrations-adapter';
import type { IntegrationDefinition, UpdateIntegrationPayload } from '../domain/types';

export function useIntegrationDetail(role: BackOfficeRole, integrationId: string | undefined) {
  const [integration, setIntegration] = useState<IntegrationDefinition | null>(null);
  const [draft, setDraft] = useState<UpdateIntegrationPayload>({});
  const [correlationFilter, setCorrelationFilter] = useState('');
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => {
    if (!integrationId) {
      setIntegration(null);
      return;
    }
    const row = integrationsService.getById(role, integrationId);
    setIntegration(row);
    if (row) setDraft({ ...row });
  }, [role, integrationId, tick]);

  useEffect(() => {
    reload();
  }, [reload]);

  const dirty = useMemo(() => {
    if (!integration) return false;
    return JSON.stringify(draft) !== JSON.stringify(integration);
  }, [integration, draft]);

  const logs = integrationId
    ? integrationsService.getLogs(role, integrationId, correlationFilter || undefined)
    : [];

  return {
    integration,
    draft,
    dirty,
    logs,
    correlationFilter,
    setCorrelationFilter,
    patchDraft: useCallback((p: Partial<UpdateIntegrationPayload>) => {
      setDraft((d) => ({ ...d, ...p }));
    }, []),
    bump: () => setTick((n) => n + 1),
  };
}
