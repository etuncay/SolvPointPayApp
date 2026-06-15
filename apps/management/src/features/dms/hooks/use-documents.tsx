import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { BackOfficeRole } from '@epay/ui';
import { documentsService } from '../api/mock-documents-adapter';
import {
  DEFAULT_DOCUMENTS_FILTERS,
  type DocumentsListFilters,
} from '../domain/types';

export function useDocuments(role: BackOfficeRole) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<DocumentsListFilters>(() => ({
    ...DEFAULT_DOCUMENTS_FILTERS,
    relationType: searchParams.get('relationType') ?? '',
    relatedId: searchParams.get('relatedId') ?? '',
  }));

  const updateFilters = useCallback((patch: Partial<DocumentsListFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const clearRelationFilter = useCallback(() => {
    setFilters((prev) => ({ ...prev, relationType: '', relatedId: '' }));
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('relationType');
        next.delete('relatedId');
        return next;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  const hasRelationFilter = Boolean(filters.relationType && filters.relatedId);

  const rows = useMemo(
    () => documentsService.list(role, filters),
    [role, filters],
  );

  return { filters, updateFilters, clearRelationFilter, hasRelationFilter, rows };
}
