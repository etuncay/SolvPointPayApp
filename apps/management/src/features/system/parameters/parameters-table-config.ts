import type { TableApiResponse, TableConfig, TableQueryParams, TranslateFn } from '@epay/ui';
import type { BackOfficeRole } from '@epay/ui';
import { PARAMETER_GROUPS } from './domain/parameter-catalog';
import { parametersService } from './api/mock-parameters-adapter';
import type { ParameterFilters, SystemParameter } from './domain/types';
import { DEFAULT_PARAMETER_FILTERS } from './domain/types';
import parametersJson from './config/parameters.table.config.json';

type TableConfigJson = Omit<TableConfig, 'api'>;

function str(value: unknown): string {
  return value == null ? '' : String(value);
}

function toFilters(params: TableQueryParams): ParameterFilters {
  const h = params.headerFilters ?? {};
  return {
    ...DEFAULT_PARAMETER_FILTERS,
    query: str(h.search),
    group: (str(h.group) || DEFAULT_PARAMETER_FILTERS.group) as ParameterFilters['group'],
    status: (str(h.status) || DEFAULT_PARAMETER_FILTERS.status) as ParameterFilters['status'],
  };
}

function sortRows(
  rows: SystemParameter[],
  sortField: string | undefined,
  sortOrder: 'asc' | 'desc' | undefined,
): SystemParameter[] {
  if (!sortField) return rows;
  const dir = sortOrder === 'desc' ? -1 : 1;
  return [...rows].sort((a, b) => {
    const av = (a as unknown as Record<string, unknown>)[sortField];
    const bv = (b as unknown as Record<string, unknown>)[sortField];
    return str(av).localeCompare(str(bv), 'tr') * dir;
  });
}

export function buildParametersTableConfig(
  role: BackOfficeRole,
  t?: TranslateFn,
  onQuery?: (filters: ParameterFilters) => void,
): TableConfig {
  const base = parametersJson as TableConfigJson;
  const localized: TableConfigJson = !t
    ? base
    : {
        ...base,
        title: t('rm_panel_params', base.title as string),
        search: base.search
          ? {
              ...base.search,
              placeholder: t('prm_search_ph', base.search.placeholder as string),
            }
          : base.search,
        advancedFilters: (base.advancedFilters ?? []).map((f) => {
          if (f.key === 'group') {
            return {
              ...f,
              label: t('prm_filter_group_any', f.label as string),
              options: [
                { label: t('prm_filter_group_any', 'Tümü'), value: 'any' },
                ...PARAMETER_GROUPS.map((g) => ({
                  label: t(`prm_group_${g}`, g),
                  value: g,
                })),
              ],
            };
          }
          if (f.key === 'status') {
            return {
              ...f,
              label: t('sc_filter_status_any', f.label as string),
              options: [
                { label: t('sc_filter_status_any', 'Tümü'), value: 'any' },
                { label: t('ib_status_Active', 'Aktif'), value: 'Active' },
                { label: t('rs_status_passive', 'Pasif'), value: 'Passive' },
              ],
            };
          }
          return f;
        }),
        columns: base.columns.map((c) => ({
          ...c,
          render: c.key === 'description' ? 'renderDescription' : c.render,
          title:
            c.key === 'groupName'
              ? t('fcd_agent_group')
              : c.key === 'parameterKey'
                ? t('prm_col_key')
                : c.key === 'value'
                  ? t('rm_hist_col_value')
                  : c.key === 'description'
                    ? t('rpt_col_desc')
                    : c.key === 'status'
                      ? t('rpt_col_status')
                      : c.key === 'changedByName'
                        ? t('prm_col_changed_by')
                        : c.key === 'changedAt'
                          ? t('prm_col_changed_at')
                          : c.title,
        })),
        toolbar: base.toolbar
          ? {
              ...base.toolbar,
              new: base.toolbar.new
                ? { ...base.toolbar.new, label: t('prm_new', base.toolbar.new.label as string) }
                : base.toolbar.new,
            }
          : base.toolbar,
      };

  return {
    ...localized,
    api: {
      method: async (params: TableQueryParams): Promise<TableApiResponse> => {
        const filters = toFilters(params);
        onQuery?.(filters);
        const rows = parametersService.list(role, filters);
        const sorted = sortRows(rows, params.sortField, params.sortOrder);
        const start = (params.page - 1) * params.pageSize;
        const pageRows = sorted.slice(start, start + params.pageSize);
        return {
          success: true,
          data: pageRows as unknown as Record<string, unknown>[],
          total: sorted.length,
        };
      },
    },
  };
}

