import { useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DynamicTable, type TableConfig } from '@epay/ui';
import { fmtMoney, fmtNumber } from '@/lib/format';
import { WIDGET_MAX_ROWS } from '@/features/dashboard/widgets/widget-props';
import type { EntityCaseReportRow, PanelState } from '../../domain/types';
import { ReportPanelShell } from '../report-panel-shell';

type SortDir = 'asc' | 'desc';

export function EntityCasesTablePanel({
  icon,
  iconTone,
  titleKey,
  entityLabelKey,
  state,
  onRetry,
  onFullscreen,
  mode = 'compact',
  filterText = '',
}: {
  icon: LucideIcon;
  iconTone?: 'accent' | 'info';
  titleKey: string;
  entityLabelKey: string;
  state?: PanelState<EntityCaseReportRow[]>;
  onRetry?: () => void;
  onFullscreen?: () => void;
  mode?: 'compact' | 'scr_fullscreen';
  filterText?: string;
}) {
  const { t, i18n } = useTranslation();
  const [sortCol, setSortCol] = useState<number | null>(4);
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const rows = state?.status === 'ready' ? state.data : [];
  const isFullscreen = mode === 'scr_fullscreen';
  const maxRows = isFullscreen ? undefined : WIDGET_MAX_ROWS;

  const cols = useMemo(
    () => [
      { key: 'entityNo' as const, label: t(entityLabelKey) },
      { key: 'displayName' as const, label: t('rpt_col_name') },
      { key: 'riskScore' as const, label: t('scr_col_risk') },
      { key: 'monthlyAvgVolumeTry' as const, label: t('scr_col_monthly_vol') },
      { key: 'caseCount' as const, label: t('scr_col_count') },
    ],
    [t, entityLabelKey],
  );

  const filtered = useMemo(() => {
    let list = [...rows];
    if (filterText.trim()) {
      const q = filterText.toLowerCase();
      list = list.filter(
        (r) =>
          r.displayName.toLowerCase().includes(q) ||
          r.entityNo.toLowerCase().includes(q),
      );
    }
    if (isFullscreen && sortCol != null) {
      const key = cols[sortCol]?.key;
      if (key) {
        list.sort((a, b) => {
          const av = a[key];
          const bv = b[key];
          const cmp =
            typeof av === 'number' && typeof bv === 'number'
              ? av - bv
              : String(av).localeCompare(String(bv), i18n.language, { numeric: true });
          return sortDir === 'asc' ? cmp : -cmp;
        });
      }
    }
    return list;
  }, [rows, filterText, isFullscreen, sortCol, sortDir, cols, i18n.language]);

  const visible = maxRows != null ? filtered.slice(0, maxRows) : filtered;

  const toggleSort = (idx: number) => {
    if (!isFullscreen) return;
    if (sortCol === idx) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortCol(idx);
      setSortDir('desc');
    }
  };

  return (
    <ReportPanelShell
      icon={icon}
      iconTone={iconTone}
      titleKey={titleKey}
      state={state}
      onRetry={onRetry}
      onFullscreen={mode === 'compact' ? onFullscreen : undefined}
      count={rows.length}
    >
      <DynamicTable
        config={
          {
            rowKey: 'rowKey',
            hideTitleBar: true,
            hideColumnFilters: true,
            pagination: false,
            columns: cols.map((c, idx) => ({
              key: c.key,
              title: `${c.label}${isFullscreen && sortCol === idx ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}`,
              dataIndex: c.key,
              render:
                c.key === 'riskScore'
                  ? 'renderRisk'
                  : c.key === 'monthlyAvgVolumeTry'
                    ? 'renderVol'
                    : c.key === 'caseCount'
                      ? 'renderCount'
                      : undefined,
            })),
            api: {
              method: async () => ({
                success: true,
                data: visible.map((r) => ({
                  ...r,
                  rowKey: `${r.entityNo}-${r.displayName}`,
                })) as unknown as Record<string, unknown>[],
                total: visible.length,
              }),
            },
          } satisfies TableConfig
        }
        permissions={{}}
        customFunctions={{
          renderRisk: (v: unknown) => <span className="mono fs-12">{fmtNumber(Number(v ?? 0), i18n.language)}</span>,
          renderVol: (v: unknown) => <span className="mono fs-12">{fmtMoney(Number(v ?? 0), i18n.language)}</span>,
          renderCount: (v: unknown) => <span className="mono fs-12">{fmtNumber(Number(v ?? 0), i18n.language)}</span>,
        }}
        locale={i18n.language}
        t={(k, fb) => t(k, { defaultValue: fb ?? k })}
      />
      {visible.length === 0 && (
        <p className="t-mute" style={{ textAlign: 'center', padding: 16 }}>
          {t('scr_empty')}
        </p>
      )}
    </ReportPanelShell>
  );
}
