import { useCallback, useMemo, useState } from 'react';
import type { BackOfficeRole } from '@epay/ui';
import { notificationTemplatesService } from '../api/mock-notifications-adapter';
import type { TemplateFilters } from '../domain/types';

export function useNotificationTemplates(role: BackOfficeRole) {
  const [filters, setFilters] = useState<TemplateFilters>({ query: '', type: 'any' });
  const [tick, setTick] = useState(0);

  const rows = useMemo(
    () => notificationTemplatesService.list(role, filters),
    [role, filters, tick],
  );

  const bump = useCallback(() => setTick((n) => n + 1), []);

  const updateFilters = useCallback((patch: Partial<TemplateFilters>) => {
    setFilters((f) => ({ ...f, ...patch }));
  }, []);

  return { rows, filters, updateFilters, bump };
}
