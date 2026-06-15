import { useCallback, useMemo, useState } from 'react';
import type { BackOfficeRole } from '@epay/ui';
import { documentReviewService } from '../api';
import { DEFAULT_QUEUE_FILTERS, type ReviewQueueFilters } from '../domain/types';

export function useDocumentReviewQueue(role: BackOfficeRole) {
  const [filters, setFilters] = useState<ReviewQueueFilters>(DEFAULT_QUEUE_FILTERS);
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => setVersion((v) => v + 1), []);

  const rows = useMemo(
    () => documentReviewService.listReviewQueue(role, filters),
    [role, filters, version],
  );

  const updateFilters = useCallback((patch: Partial<ReviewQueueFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  return { filters, updateFilters, rows, refresh };
}
