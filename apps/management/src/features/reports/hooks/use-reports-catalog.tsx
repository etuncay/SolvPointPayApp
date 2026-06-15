import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { BackOfficeRole } from '@epay/ui';
import { reportsService } from '../api/mock-reports-adapter';
import { visibleCategories } from '../domain/permissions';
import type { ReportDefinition } from '../domain/types';

export function useReportsCatalog(role: BackOfficeRole) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const catalog = useMemo(() => reportsService.getCatalog(role), [role]);
  const categories = visibleCategories(role);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter((d) => {
      const title = t(d.titleKey).toLowerCase();
      const desc = t(d.descriptionKey).toLowerCase();
      return title.includes(q) || desc.includes(q) || d.code.includes(q);
    });
  }, [catalog, search, t]);

  const byCategory = useMemo(() => {
    const map: Record<string, ReportDefinition[]> = {
      operational: [],
      tcmb: [],
      masak: [],
    };
    for (const d of filtered) {
      map[d.category]?.push(d);
    }
    return map;
  }, [filtered]);

  return { search, setSearch, catalog, categories, byCategory };
}
