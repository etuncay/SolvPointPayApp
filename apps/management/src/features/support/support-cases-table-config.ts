import type { TableApiResponse, TableConfig, TableQueryParams, TranslateFn } from '@epay/ui';
import type { BackOfficeRole } from '@epay/ui';
import { STAFF_OPTIONS } from './form/mocks/staff';
import { supportCasesService } from './api/mock-support-cases-adapter';
import type { SupportCaseFilters, SupportCaseListRow } from './domain/types';
import tableConfigJson from './config/support-cases.table.config.json';

type TableConfigJson = Omit<TableConfig, 'api'>;

function str(value: unknown): string {
  return value == null ? '' : String(value);
}

function toFilters(params: TableQueryParams): SupportCaseFilters {
  const h = params.headerFilters ?? {};
  return {
    query: str(h.search),
    complaintType: str(h.complaintType) || 'any',
    status: str(h.status) || 'all',
    urgency: str(h.urgency) || 'any',
    criticality: str(h.criticality) || 'any',
    ownerUserId: str(h.ownerUserId) || 'any',
    createdFrom: str(h.createdFrom),
    createdTo: str(h.createdTo),
    updatedFrom: str(h.updatedFrom),
    updatedTo: str(h.updatedTo),
    assignedToMe: Boolean(h.assignedToMe),
  };
}

function sortRows(
  rows: SupportCaseListRow[],
  sortField: string | undefined,
  sortOrder: 'asc' | 'desc' | undefined,
): SupportCaseListRow[] {
  if (!sortField) return rows;
  const dir = sortOrder === 'desc' ? -1 : 1;
  return [...rows].sort(
    (a, b) =>
      String(a[sortField as keyof SupportCaseListRow] ?? '').localeCompare(
        String(b[sortField as keyof SupportCaseListRow] ?? ''),
        'tr',
      ) * dir,
  );
}

export function buildSupportCasesTableConfig(
  role: BackOfficeRole,
  userId: string,
  t?: TranslateFn,
): TableConfig {
  const base = tableConfigJson as TableConfigJson;
  const advancedFilters = (base.advancedFilters ?? []).map((f) => {
    if (f.key !== 'ownerUserId') return f;
    return {
      ...f,
      options: [
        { label: t?.('sc_filter_owner_any', 'Tümü') ?? 'Tümü', value: 'any' },
        ...STAFF_OPTIONS.map((s) => ({ label: s.label, value: s.id })),
      ],
    };
  });

  return {
    ...base,
    title: t?.('m_support', base.title as string) ?? (base.title as string),
    advancedFilters,
    api: {
      method: (params: TableQueryParams): Promise<TableApiResponse> => {
        const filters = toFilters(params);
        const filtered = supportCasesService.list(role, userId, filters);
        const sorted = sortRows(filtered, params.sortField, params.sortOrder);
        const start = (params.page - 1) * params.pageSize;
        const pageRows = sorted.slice(start, start + params.pageSize);

        const countsBase = supportCasesService.list(role, userId, { ...filters, status: 'all' });
        const countBy = (status: string) =>
          supportCasesService.list(role, userId, { ...filters, status }).length;

        return Promise.resolve({
          success: true,
          data: pageRows as unknown as Record<string, unknown>[],
          total: sorted.length,
          meta: {
            counts: {
              open: countBy('open'),
              resolved: countBy('resolved'),
              rejected: countBy('rejected'),
              reOpened: countBy('reOpened'),
              all: countsBase.length,
            },
          },
        });
      },
    },
  };
}
