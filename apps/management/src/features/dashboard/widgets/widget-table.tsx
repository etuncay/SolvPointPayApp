import { useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DynamicTable, type TableConfig, type TableCustomFunctions } from '@epay/ui';
import type { WidgetCode } from '../domain/types';
import { useWidgetNavigation } from '../hooks/use-widget-navigation';
import { WidgetShell } from './widget-shell';
import { WIDGET_COMPACT_ROWS, WIDGET_MAX_ROWS, type WidgetProps } from './widget-props';

type SortDir = 'asc' | 'desc';

type ColumnDef = { label: string; width?: number; align?: 'left' | 'right' };

export function WidgetTable({
  widgetCode,
  icon,
  iconTone = 'accent',
  titleKey,
  count,
  countTone,
  meta,
  rows,
  rowIds,
  columns,
  sortable = false,
  loading,
  error,
  onRetry,
  refreshedAt,
  onFullscreen,
  mode = 'compact',
  filterText = '',
  searchKeys,
  detailLevel = 'full',
}: WidgetProps & {
  widgetCode: WidgetCode;
  icon: LucideIcon;
  iconTone?: 'accent' | 'warn' | 'danger' | 'ok' | 'info';
  titleKey: string;
  count?: number;
  countTone?: string;
  meta?: React.ReactNode;
  rows: React.ReactNode[][];
  rowIds?: string[];
  searchKeys?: string[];
  columns: ColumnDef[];
  sortable?: boolean;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  refreshedAt?: Date;
}) {
  const { t, i18n } = useTranslation();
  const { goToWidget, goToRow } = useWidgetNavigation();
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const isFullscreen = mode === 'scr_fullscreen';
  const maxRows = isFullscreen
    ? undefined
    : detailLevel === 'compact'
      ? WIDGET_COMPACT_ROWS
      : WIDGET_MAX_ROWS;

  const indexed = useMemo(
    () => rows.map((cells, i) => ({ cells, id: rowIds?.[i] ?? String(i), search: searchKeys?.[i] ?? '' })),
    [rows, rowIds, searchKeys],
  );

  const filtered = useMemo(() => {
    if (!filterText.trim()) return indexed;
    const q = filterText.toLowerCase();
    return indexed.filter((r) => r.search.toLowerCase().includes(q));
  }, [indexed, filterText]);

  const sorted = useMemo(() => {
    if (!isFullscreen || sortCol == null || !sortable) return filtered;
    return [...filtered].sort((a, b) => {
      const av = String(a.cells[sortCol] ?? '');
      const bv = String(b.cells[sortCol] ?? '');
      const cmp = av.localeCompare(bv, i18n.language, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, isFullscreen, sortCol, sortDir, sortable, i18n.language]);

  const visible = maxRows != null ? sorted.slice(0, maxRows) : sorted;

  const timeLabel = refreshedAt
    ? refreshedAt.toLocaleTimeString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : t('now');

  const toggleSort = (colIdx: number) => {
    if (!isFullscreen || !sortable) return;
    if (sortCol === colIdx) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortCol(colIdx);
      setSortDir('asc');
    }
  };

  return (
    <WidgetShell
      icon={icon}
      iconTone={iconTone}
      titleKey={titleKey}
      count={count}
      countTone={countTone}
      meta={meta}
      loading={loading}
      error={error}
      onRetry={onRetry}
      onFullscreen={onFullscreen}
      footerLeft={
        <>
          {t('last_updated')} · {timeLabel}
        </>
      }
      footerLink={
        <button
          type="button"
          className="link-btn"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit' }}
          onClick={() => goToWidget(widgetCode)}
        >
          {t('view_all')} →
        </button>
      }
    >
      <DynamicTable
        config={
          {
            rowKey: 'id',
            hideTitleBar: true,
            hideColumnFilters: true,
            pagination: false,
            columns: columns.map((c, idx) => ({
              key: `col_${idx}`,
              title: `${c.label}${isFullscreen && sortable && sortCol === idx ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}`,
              dataIndex: `c${idx}`,
              width: c.width,
              align: c.align === 'right' ? 'right' : 'left',
              render: `renderCol${idx}`,
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
        customFunctions={
          columns.reduce((acc, _c, idx) => {
            (acc as Record<string, (v: unknown, row: Record<string, unknown>) => React.ReactNode>)[`renderCol${idx}`] = (
              v: unknown,
              row: Record<string, unknown>,
            ) => (
              <span
                className={columns[idx]?.align === 'right' ? 'amount' : undefined}
                style={rowIds ? { cursor: 'pointer' } : undefined}
                onClick={() => {
                  if (!rowIds) return;
                  const rowId = String(row.id ?? '');
                  if (rowId) goToRow(widgetCode, rowId);
                }}
              >
                {v as React.ReactNode}
              </span>
            );
            return acc;
          }, {} as TableCustomFunctions)
        }
        locale={i18n.language}
        t={(k, fb) => t(k, { defaultValue: fb ?? k })}
      />
    </WidgetShell>
  );
}
