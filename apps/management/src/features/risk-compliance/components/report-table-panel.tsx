import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FRAUD_RULE_ID_BY_TITLE } from '@/mocks/fraud-rules';
import type { LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DynamicTable, type TableConfig } from '@epay/ui';
import { fmtMoney, fmtNumber } from '@/lib/format';
import { WidgetShell } from '@/features/dashboard/widgets/widget-shell';
import { WIDGET_MAX_ROWS } from '@/features/dashboard/widgets/widget-props';
import type { ReportCode, PanelState } from '../domain/types';

type SortDir = 'asc' | 'desc';

export type ReportColumn = {
  labelKey: string;
  width?: number;
  sortKey?: string;
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
};

export function ReportTablePanel({
  icon,
  iconTone = 'accent',
  titleKey,
  columns,
  state,
  onRetry,
  onFullscreen,
  mode = 'compact',
  filterText = '',
}: {
  reportCode: ReportCode;
  icon: LucideIcon;
  iconTone?: 'accent' | 'warn' | 'danger' | 'ok' | 'info';
  titleKey: string;
  columns: ReportColumn[];
  state?: PanelState<Record<string, unknown>[]>;
  onRetry?: () => void;
  onFullscreen?: () => void;
  mode?: 'compact' | 'scr_fullscreen';
  filterText?: string;
}) {
  const { t, i18n } = useTranslation();
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const loading = !state || state.status === 'loading';
  const error = state?.status === 'error' ? t('error_loading') : undefined;
  const rows = state?.status === 'ready' ? state.data : [];
  const isFullscreen = mode === 'scr_fullscreen';
  const maxRows = isFullscreen ? undefined : WIDGET_MAX_ROWS;

  const colDefs = columns.map((c) => ({
    label: t(c.labelKey),
    width: c.width,
    sortKey: c.sortKey,
  }));

  const indexed = useMemo(
    () =>
      rows.map((row, i) => ({
        id: String(i),
        row,
        search: columns
          .map((c) => String(row[c.sortKey ?? ''] ?? ''))
          .join(' ')
          .toLowerCase(),
        cells: columns.map((col) => {
          const raw = row[col.sortKey ?? ''];
          if (col.render) return col.render(raw, row);
          return String(raw ?? '—');
        }),
      })),
    [rows, columns],
  );

  const filtered = useMemo(() => {
    if (!filterText.trim()) return indexed;
    const q = filterText.toLowerCase();
    return indexed.filter((r) => r.search.includes(q));
  }, [indexed, filterText]);

  const sorted = useMemo(() => {
    if (!isFullscreen || sortCol == null) return filtered;
    const key = columns[sortCol]?.sortKey;
    if (!key) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a.row[key];
      const bv = b.row[key];
      const cmp =
        typeof av === 'number' && typeof bv === 'number'
          ? av - bv
          : String(av ?? '').localeCompare(String(bv ?? ''), i18n.language, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, isFullscreen, sortCol, sortDir, columns, i18n.language]);

  const visible = maxRows != null ? sorted.slice(0, maxRows) : sorted;

  const timeLabel =
    state?.status === 'ready'
      ? state.refreshedAt.toLocaleTimeString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : t('now');

  const toggleSort = (colIdx: number) => {
    if (!isFullscreen) return;
    if (sortCol === colIdx) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortCol(colIdx);
      setSortDir('desc');
    }
  };

  // Hücreler `indexed` içinde önceden render ediliyor (string veya <Link> gibi
  // ReactNode). DynamicTable, `render` tanımı olmayan kolonlarda değeri
  // formatCellValue ile string'e çevirir → React elementi `[object Object]` olur.
  // Her kolon için passthrough render fonksiyonu verip ReactNode'u olduğu gibi döndürüyoruz.
  const cellRenderers = useMemo(() => {
    const fns: Record<string, (v: unknown) => React.ReactNode> = {};
    columns.forEach((_, idx) => {
      fns[`cell_${idx}`] = (v) => v as React.ReactNode;
    });
    return fns;
  }, [columns]);

  return (
    <WidgetShell
      icon={icon}
      iconTone={iconTone}
      titleKey={titleKey}
      count={rows.length}
      loading={loading}
      error={error}
      onRetry={onRetry}
      onFullscreen={mode === 'compact' ? onFullscreen : undefined}
      footerLeft={
        <>
          {t('last_updated')} · {timeLabel}
        </>
      }
      footerLink={
        mode === 'compact' && onFullscreen ? (
          <button
            type="button"
            className="link-btn"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit' }}
            onClick={onFullscreen}
          >
            {t('view_all')} →
          </button>
        ) : undefined
      }
    >
      <DynamicTable
        config={
          {
            rowKey: 'id',
            hideTitleBar: true,
            hideColumnFilters: true,
            pagination: false,
            columns: colDefs.map((c, idx) => ({
              key: `col_${idx}`,
              title: `${c.label}${isFullscreen && sortCol === idx ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}`,
              dataIndex: `c${idx}`,
              width: c.width,
              render: `cell_${idx}`,
            })),
            api: {
              method: async () => ({
                success: true,
                data: visible.map((row) => {
                  const out: Record<string, unknown> = { id: row.id };
                  row.cells.forEach((cell, idx) => {
                    out[`c${idx}`] = cell;
                  });
                  return out;
                }),
                total: visible.length,
              }),
            },
          } satisfies TableConfig
        }
        permissions={{}}
        customFunctions={cellRenderers}
        locale={i18n.language}
        t={(k, fb) => t(k, { defaultValue: fb ?? k })}
      />
    </WidgetShell>
  );
}

export function partyColumns(
  lang: string,
  linkSource?: 'Customer' | 'Agent',
): ReportColumn[] {
  return [
    {
      labelKey: 'rc_col_party_no',
      sortKey: 'partyNo',
      width: 100,
      render: (v) => {
        const id = String(v ?? '');
        if (!linkSource || !id) return id;
        return (
          <Link
            to={`/risk/scores?source=${linkSource}&id=${encodeURIComponent(id)}`}
            className="link mono"
          >
            {id}
          </Link>
        );
      },
    },
    { labelKey: 'rpt_col_name', sortKey: 'name' },
    { labelKey: 'rc_col_case_count', sortKey: 'caseCount', width: 80, render: (v) => fmtNumber(Number(v), lang) },
    { labelKey: 'rc_col_blocked_tx', sortKey: 'blockedTxCount', width: 90, render: (v) => fmtNumber(Number(v), lang) },
    { labelKey: 'rc_col_risk_score', sortKey: 'riskScore', width: 80, render: (v) => fmtNumber(Number(v), lang) },
    { labelKey: 'rc_col_disputes', sortKey: 'disputeCount', width: 80, render: (v) => fmtNumber(Number(v), lang) },
  ];
}

export function rulePerformanceColumns(lang: string): ReportColumn[] {
  return [
    {
      labelKey: 'rc_col_rule_name',
      sortKey: 'ruleName',
      render: (v) => {
        const name = String(v ?? '');
        const ruleId = FRAUD_RULE_ID_BY_TITLE[name];
        if (!ruleId) return name;
        return (
          <Link to={`/risk/fraud-rules/${ruleId}`} className="link">
            {name}
          </Link>
        );
      },
    },
    { labelKey: 'rc_col_alarms', sortKey: 'alarmCount', width: 80, render: (v) => fmtNumber(Number(v), lang) },
    { labelKey: 'rc_col_cases_opened', sortKey: 'casesOpened', width: 90, render: (v) => fmtNumber(Number(v), lang) },
    { labelKey: 'rc_col_tp', sortKey: 'truePositive', width: 70, render: (v) => fmtNumber(Number(v), lang) },
    {
      labelKey: 'rc_col_tp_rate',
      sortKey: 'tpRate',
      width: 80,
      render: (v) => `${Math.round(Number(v) * 100)}%`,
    },
    {
      labelKey: 'rc_col_avg_close',
      sortKey: 'avgCloseDays',
      width: 100,
      render: (v) => `${Number(v).toFixed(1)} ${lang === 'tr' ? 'gün' : 'd'}`,
    },
  ];
}

export function staffPerformanceColumns(lang: string): ReportColumn[] {
  return [
    { labelKey: 'rpt_col_staff', sortKey: 'staffName' },
    { labelKey: 'rc_col_handled', sortKey: 'casesHandled', width: 80, render: (v) => fmtNumber(Number(v), lang) },
    { labelKey: 'rc_col_escalation', sortKey: 'escalations', width: 80, render: (v) => fmtNumber(Number(v), lang) },
    { labelKey: 'rc_col_rejections', sortKey: 'rejections', width: 70, render: (v) => fmtNumber(Number(v), lang) },
    { labelKey: 'rc_col_approvals', sortKey: 'approvals', width: 70, render: (v) => fmtNumber(Number(v), lang) },
    {
      labelKey: 'rc_col_workload_try',
      sortKey: 'closedWorkloadTry',
      width: 120,
      render: (v) => <span className="mono">{fmtMoney(Number(v), lang)}</span>,
    },
  ];
}

export function highRiskColumns(lang: string): ReportColumn[] {
  return [
    { labelKey: 'rc_col_tx_no', sortKey: 'txNo', width: 110 },
    { labelKey: 'rpt_col_date', sortKey: 'date', width: 100 },
    { labelKey: 'scf_entity_customer', sortKey: 'customerName' },
    {
      labelKey: 'rpt_col_amount_try',
      sortKey: 'amount',
      width: 120,
      render: (v) => <span className="mono">{fmtMoney(Number(v), lang)}</span>,
    },
    { labelKey: 'rc_col_risk_score', sortKey: 'riskScore', width: 80, render: (v) => fmtNumber(Number(v), lang) },
    { labelKey: 'rc_col_approved_by', sortKey: 'approvedBy', width: 100 },
    { labelKey: 'rpt_col_desc', sortKey: 'description' },
  ];
}
