import { useCallback, useMemo, useState } from 'react';
import type { BackOfficeRole } from '@epay/ui';
import { documentTypesService } from '../api/mock-document-types-adapter';
import {
  DEFAULT_DOCUMENT_TYPES_FILTERS,
  type DocumentTypesFilters,
} from '../domain/types';

export function useDocumentTypes(role: BackOfficeRole) {
  const [filters, setFilters] = useState<DocumentTypesFilters>(DEFAULT_DOCUMENT_TYPES_FILTERS);

  const updateFilters = useCallback((patch: Partial<DocumentTypesFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const rows = useMemo(
    () => documentTypesService.list(filters, role),
    [filters, role],
  );

  return { filters, updateFilters, rows };
}
