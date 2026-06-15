/* ──────────────────────────────────────────────────────
 *  DynamicTable — config-driven table renderer
 *  Liste UX: FilterBar (chip + arama + gelişmiş filtre) + DataGrid
 * ────────────────────────────────────────────────────── */
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table';
import { Columns3, Eye, Pencil, Trash2, X } from 'lucide-react';
import type {
  AdvancedFilterSpan,
  DynamicTableProps,
  TableAdvancedFilterConfig,
  TableApiResponse,
  TableQueryParams,
  ToolbarButtonConfig,
} from './types';
import { canTableDelete, canTableEdit, canTableView } from './table-permissions';
import { TablePageHead } from './table-page-head';
import { useConfirm } from './use-confirm';
import { exportTableCsv, formatCellValue } from './export-csv';
import { AdvancedFilters, AdvFilterGroup, AdvFilterRow } from '../composite/advanced-filters';
import { DataGrid, SelectColumn, type ColumnFilterConfig } from '../composite/data-grid';
import { BulkBar } from '../composite/bulk-bar';
import { ColumnVisibilityPanel } from '../composite/column-visibility-panel';
import type { PaginationLabels } from '../primitives/pagination';
import { FilterBar } from '../composite/filter-bar';
import { Button } from '../primitives/button';
import { Popover, PopoverContent, PopoverTrigger } from '../primitives/popover';
import { cn } from '../lib/utils';

function buildQueryParams(
  page: number,
  pageSize: number,
  sorting: SortingState,
  columnFilters: Record<string, string>,
  headerFilters: Record<string, unknown>,
  tabFilters: Record<string, unknown>,
  search: string,
): TableQueryParams {
  const mergedHeader: Record<string, unknown> = { ...headerFilters };
  if (search.trim()) mergedHeader.search = search.trim();

  return {
    page,
    pageSize,
    sortField: sorting[0]?.id,
    sortOrder: sorting[0]?.desc ? 'desc' : sorting[0] ? 'asc' : undefined,
    filters: Object.keys(columnFilters).length ? columnFilters : undefined,
    headerFilters: Object.keys(mergedHeader).length ? mergedHeader : undefined,
    tabFilters: Object.keys(tabFilters).length ? tabFilters : undefined,
  };
}

/** statusMap verilmediğinde kullanılan varsayılan durum→sınıf sezgisi. */
function defaultStatusClass(val: string): string {
  return val === 'Active'
    ? 'active'
    : val === 'Passive' || val === 'Inactive'
      ? 'inactive'
      : val === 'Pending'
        ? 'pending'
        : val === 'Blocked'
          ? 'danger'
          : 'muted';
}

function fmtCount(n: number, lang?: string): string {
  return new Intl.NumberFormat(lang === 'tr' ? 'tr-TR' : 'en-US').format(n);
}

export function DynamicTable({
  config,
  permissions,
  customFunctions,
  header,
  onRowClick,
  onView,
  onEdit,
  onDelete,
  confirmOnDelete = true,
  onNew,
  onExport,
  onToolbarButtonClick,
  onBulkAction,
  onDataChange,
  t = (k, fb) => fb ?? k,
  locale = 'tr',
  className,
}: DynamicTableProps) {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState((config.pagination || undefined)?.defaultPageSize ?? 15);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [headerFilters, setHeaderFilters] = useState<Record<string, unknown>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(config.tabs?.[0]?.key ?? 'all');
  const [showAdv, setShowAdv] = useState(false);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState<Record<string, unknown>>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => {
    const v: VisibilityState = {};
    for (const c of config.columns) if (c.hidden) v[c.key] = false;
    return v;
  });
  const { confirm, dialog } = useConfirm();
  const fetchRef = useRef(0);

  const tabFilters = useMemo(() => {
    if (!config.tabs?.length) return {};
    const tab = config.tabs.find((tb) => tb.key === activeTab);
    return tab?.filters ?? {};
  }, [config.tabs, activeTab]);

  const chips = useMemo(() => {
    if (!config.tabs?.length) return undefined;
    return config.tabs.map((tab) => ({
      value: tab.key,
      label: tab.title,
      count:
        tab.countKey && meta[tab.countKey] != null
          ? Number(meta[tab.countKey])
          : tab.key === 'all' && meta.allCount != null
            ? Number(meta.allCount)
            : undefined,
    }));
  }, [config.tabs, meta]);

  const activeAdvancedCount = useMemo(() => {
    if (!config.advancedFilters?.length) return 0;
    return config.advancedFilters.filter((f) => {
      const v = headerFilters[f.key];
      return v != null && v !== '' && v !== 'any';
    }).length;
  }, [config.advancedFilters, headerFilters]);

  /** Gelişmiş filtreleri grid satırlarına çöz: layout.rows varsa onu kullan, yoksa tek satır */
  const advancedFilterRows = useMemo(() => {
    const filters = config.advancedFilters ?? [];
    if (!filters.length) return [];
    const layout = config.advancedFiltersLayout;
    const defaultSpan: AdvancedFilterSpan = layout?.defaultSpan ?? 3;
    const byKey = new Map(filters.map((f) => [f.key, f]));

    const withSpan = (f: TableAdvancedFilterConfig, span?: AdvancedFilterSpan) => ({
      ...f,
      span: span ?? f.span ?? defaultSpan,
    });

    if (layout?.rows?.length) {
      return layout.rows.map((row) =>
        row.filters
          .map((rf) => {
            const base = byKey.get(rf.key);
            return base ? withSpan(base, rf.span) : null;
          })
          .filter((f): f is TableAdvancedFilterConfig & { span: AdvancedFilterSpan } => f != null),
      );
    }

    return [filters.map((f) => withSpan(f))];
  }, [config.advancedFilters, config.advancedFiltersLayout]);

  const paginationLabels = useMemo((): PaginationLabels => {
    const tr = locale === 'tr';
    return {
      rowsPerPage: t('p_rows_per', tr ? 'Satır:' : 'Rows:'),
      of: t('cust_of', tr ? '/' : 'of'),
      first: t('p_first', tr ? 'İlk' : 'First'),
      prev: t('p_prev', tr ? 'Önceki' : 'Prev'),
      next: t('p_next', tr ? 'Sonraki' : 'Next'),
      last: t('p_last', tr ? 'Son' : 'Last'),
    };
  }, [t, locale]);

  const handleSortingChange = useCallback(
    (next: SortingState) => {
      setSorting(next);
      setPageIndex(0);
    },
    [],
  );

  const fetchData = useCallback(async () => {
    const id = ++fetchRef.current;
    setLoading(true);
    try {
      const params = buildQueryParams(
        pageIndex + 1,
        pageSize,
        sorting,
        columnFilters,
        headerFilters,
        tabFilters,
        searchQuery,
      );
      const resp: TableApiResponse = await config.api.method(params);
      if (id !== fetchRef.current) return;
      if (resp.success) {
        setData(resp.data);
        setTotal(resp.total);
        if (resp.meta) setMeta(resp.meta);
        onDataChange?.(resp.data, resp.total);
      }
    } catch (err) {
      console.error('[DynamicTable] fetch error', err);
    } finally {
      if (id === fetchRef.current) setLoading(false);
    }
  }, [
    config.api,
    pageIndex,
    pageSize,
    sorting,
    columnFilters,
    headerFilters,
    tabFilters,
    searchQuery,
  ]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setPageIndex(0);
  };

  const handleColumnFilterChange = (id: string, value: string) => {
    setColumnFilters((prev) => ({ ...prev, [id]: value }));
    setPageIndex(0);
  };

  const updateHeaderFilter = (key: string, value: unknown) => {
    setHeaderFilters((prev) => ({ ...prev, [key]: value }));
    setPageIndex(0);
  };

  const clearAdvancedFilters = () => {
    const cleared: Record<string, unknown> = {};
    for (const f of config.advancedFilters ?? []) {
      cleared[f.key] = f.type === 'select' ? 'any' : '';
    }
    setHeaderFilters(cleared);
    setPageIndex(0);
  };

  const renderAdvancedFilterControl = (f: TableAdvancedFilterConfig) => {
    if (f.type === 'select') {
      return (
        <select
          className="select"
          value={String(headerFilters[f.key] ?? 'any')}
          onChange={(e) => updateHeaderFilter(f.key, e.target.value)}
        >
          <option value="any">{t('ib_all', 'Tümü')}</option>
          {(f.options ?? []).map((o) => (
            <option key={String(o.value)} value={String(o.value)}>
              {o.label}
            </option>
          ))}
        </select>
      );
    }
    if (f.type === 'date') {
      return (
        <input
          type="date"
          className="input"
          value={String(headerFilters[f.key] ?? '')}
          onChange={(e) => updateHeaderFilter(f.key, e.target.value)}
        />
      );
    }
    return (
      <input
        type="text"
        className="input"
        placeholder={f.placeholder}
        value={String(headerFilters[f.key] ?? '')}
        onChange={(e) => updateHeaderFilter(f.key, e.target.value)}
      />
    );
  };

  const handleExport = useCallback(() => {
    if (config.toolbar?.export?.onClick) {
      config.toolbar.export.onClick();
      return;
    }
    if (onExport) {
      onExport(data);
      return;
    }
    exportTableCsv(config.columns, data, (config.title ?? 'export').replace(/\s+/g, '_'), { locale, t });
  }, [config.columns, config.title, config.toolbar?.export, data, onExport, locale, t]);

  const handleNew = useCallback(() => {
    if (config.toolbar?.new?.onClick) {
      config.toolbar.new.onClick();
      return;
    }
    onNew?.();
  }, [config.toolbar?.new, onNew]);

  const handleCustomToolbarButton = useCallback(
    async (btn: ToolbarButtonConfig) => {
      if (btn.confirm) {
        const ok = await confirm({
          description: btn.confirm,
          confirmLabel: t('cust_confirm', 'Onayla'),
          cancelLabel: t('cust_cancel', 'Vazgeç'),
          danger: btn.variant === 'danger',
        });
        if (!ok) return;
      }
      const fn = customFunctions?.[btn.key];
      if (typeof fn === 'function') {
        await (fn as () => void | Promise<void>)();
        return;
      }
      await onToolbarButtonClick?.(btn.key);
    },
    [customFunctions, onToolbarButtonClick, confirm, t],
  );

  const requestDelete = useCallback(
    async (row: Record<string, unknown>) => {
      if (!confirmOnDelete) {
        onDelete?.(row);
        return;
      }
      const ok = await confirm({
        title: t('table_delete_title', 'Kaydı sil'),
        description: t('table_delete_confirm', 'Silmek istediğinize emin misiniz?'),
        confirmLabel: t('table_delete', 'Sil'),
        cancelLabel: t('cust_cancel', 'Vazgeç'),
        danger: true,
      });
      if (ok) onDelete?.(row);
    },
    [confirm, confirmOnDelete, onDelete, t],
  );

  const columns: ColumnDef<Record<string, unknown>, unknown>[] = useMemo(() => {
    const cols: ColumnDef<Record<string, unknown>, unknown>[] = [];

    if (config.selectable) {
      cols.push(SelectColumn<Record<string, unknown>>());
    }

    if (onView || onEdit || onDelete) {
      cols.push({
        id: 'actions',
        header: '',
        size: 116,
        enableSorting: false,
        cell: ({ row }) => (
          <div className="actions-col">
            {onView && canTableView(permissions) && (
              <button
                type="button"
                className="icon-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onView(row.original);
                }}
                title={t('table_view', 'Görüntüle')}
              >
                <Eye size={14} />
              </button>
            )}
            {onEdit && canTableEdit(permissions) && (
              <button
                type="button"
                className="icon-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(row.original);
                }}
                title={t('table_edit', 'Düzenle')}
              >
                <Pencil size={14} />
              </button>
            )}
            {onDelete && canTableDelete(permissions) && (
              <button
                type="button"
                className="icon-btn danger"
                onClick={(e) => {
                  e.stopPropagation();
                  void requestDelete(row.original);
                }}
                title={t('table_delete', 'Sil')}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ),
      });
    }

    for (const col of config.columns) {
      cols.push({
        id: col.key,
        accessorKey: col.dataIndex,
        header: col.title,
        size: col.width,
        minSize: col.minWidth,
        enableSorting: col.sortable ?? false,
        meta: { align: col.align },
        cell: ({ getValue, row }) => {
          // render anahtarı yalnızca customFunctions'ta GERÇEK fonksiyon ise çağrılır;
          // yanlış config (string/obje) ile tablo render'ı çökmesin (React #130 koruması).
          if (col.render && typeof customFunctions?.[col.render] === 'function') {
            const fn = customFunctions[col.render] as (
              val: unknown,
              row: Record<string, unknown>,
            ) => ReactNode;
            return fn(getValue(), row.original);
          }
          if (col.format === 'status') {
            const val = String(getValue() ?? '');
            const cls = col.statusMap?.[val] ?? defaultStatusClass(val);
            return <span className={`st ${cls}`}>{val}</span>;
          }
          if (col.mono || col.format === 'mono') {
            return <span className="mono fs-12">{formatCellValue(getValue(), col.format, { locale, t })}</span>;
          }
          return <span className="fs-12">{formatCellValue(getValue(), col.format, { locale, t })}</span>;
        },
      });
    }

    return cols;
  }, [
    config.columns,
    config.selectable,
    customFunctions,
    onView,
    onEdit,
    onDelete,
    permissions,
    requestDelete,
    locale,
    t,
  ]);

  const columnFilterCfg = useMemo(() => {
    if (config.hideColumnFilters || config.advancedFilters?.length) return undefined;
    const cfg: Record<string, ColumnFilterConfig> = {};
    for (const col of config.columns) {
      if (col.filter) {
        if (col.filter.type === 'select' || col.filter.type === 'multi-select') {
          cfg[col.key] = {
            type: col.filter.type === 'multi-select' ? 'multi-select' : 'select',
            placeholder: col.filter.placeholder,
            options: (col.filter.options ?? []).map((o) => ({
              value: String(o.value),
              label: o.label,
            })),
          };
        } else {
          cfg[col.key] = { type: 'text', placeholder: col.filter.placeholder };
        }
      }
    }
    return Object.keys(cfg).length > 0 ? cfg : undefined;
  }, [config.columns, config.hideColumnFilters, config.advancedFilters]);

  const getRowId = useCallback(
    (row: Record<string, unknown>) => {
      // Açık rowKey verilmişse onu kullan; değeri null/undefined ise fallback zincirine düş.
      if (config.rowKey != null) {
        const explicit = row[config.rowKey];
        if (explicit != null) return String(explicit);
      }
      // Fallback zinciri: id → key → userId → email → serileştirilmiş kayıt.
      // 'undefined' anahtarıyla satırların çakışmasını (duplicate React key) önler.
      if (row.id != null) return String(row.id);
      if (row.key != null) return String(row.key);
      if (row.userId != null) return String(row.userId);
      if (row.email != null) return String(row.email);
      try {
        return `row-${encodeURIComponent(JSON.stringify(row))}`;
      } catch {
        return `row-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      }
    },
    [config.rowKey],
  );

  const selectedRows = useMemo(
    () => data.filter((r) => rowSelection[getRowId(r)]),
    [data, rowSelection, getRowId],
  );
  const selectedCount = useMemo(
    () => Object.values(rowSelection).filter(Boolean).length,
    [rowSelection],
  );

  const handleBulkAction = useCallback(
    async (btn: ToolbarButtonConfig) => {
      if (btn.confirm) {
        const ok = await confirm({
          description: btn.confirm,
          confirmLabel: t('cust_confirm', 'Onayla'),
          cancelLabel: t('cust_cancel', 'Vazgeç'),
          danger: btn.variant === 'danger',
        });
        if (!ok) return;
      }
      const fn = customFunctions?.[btn.key];
      if (typeof fn === 'function') {
        await (fn as (rows: Record<string, unknown>[]) => void | Promise<void>)(selectedRows);
      } else {
        await onBulkAction?.(btn.key, selectedRows);
      }
    },
    [confirm, customFunctions, onBulkAction, selectedRows, t],
  );

  const toggleableColumns = useMemo(
    () => config.columns.map((c) => ({ id: c.key, label: c.title })),
    [config.columns],
  );

  const hasFilterBarControls =
    Boolean(config.tabs?.length) ||
    Boolean(config.search) ||
    Boolean(config.advancedFilters?.length);

  const showPageHead = !header?.hidePageHead && !config.hideTitleBar;

  return (
    <div className={cn('dynamic-table', className)}>
      {dialog}
      {showPageHead && (
        <TablePageHead
          header={header}
          config={config}
          permissions={permissions}
          dataCount={data.length}
          loading={loading}
          onExport={handleExport}
          onNew={onNew || config.toolbar?.new ? handleNew : undefined}
          onCustomButton={(btn) => void handleCustomToolbarButton(btn)}
          t={t}
        />
      )}

      <div style={showPageHead ? { marginTop: 16 } : undefined}>
      {hasFilterBarControls ? (
      <FilterBar
        chips={chips}
        chipValue={config.tabs?.length ? activeTab : undefined}
        onChipChange={config.tabs?.length ? handleTabChange : undefined}
        searchValue={config.search ? searchQuery : undefined}
        onSearchChange={
          config.search
            ? (q) => {
                setSearchQuery(q);
                setPageIndex(0);
              }
            : undefined
        }
        searchPlaceholder={config.search?.placeholder ?? t('table_search', 'Ara…')}
        showAdvanced={config.advancedFilters?.length ? showAdv : undefined}
        onToggleAdvanced={
          config.advancedFilters?.length ? () => setShowAdv((v) => !v) : undefined
        }
        advancedLabel={t('sc_filters_label', 'Filtreler')}
        advancedCloseLabel={t('cust_advanced_close', 'Filtreleri kapat')}
        filterCount={config.advancedFilters?.length ? activeAdvancedCount : undefined}
        advancedToolbarSlot={
          config.advancedFilters?.length && activeAdvancedCount > 0 && !showAdv ? (
            <Button type="button" variant="ghost" size="sm" onClick={clearAdvancedFilters}>
              <X size={12} /> {t('cust_clear', 'Temizle')}
            </Button>
          ) : undefined
        }
      />
      ) : null}

      {showAdv && advancedFilterRows.length > 0 && (
        <AdvancedFilters
          actions={
            <Button type="button" variant="ghost" size="sm" onClick={clearAdvancedFilters}>
              <X size={12} /> {t('cust_clear', 'Temizle')}
            </Button>
          }
        >
          {advancedFilterRows.map((row, i) => (
            <AdvFilterRow key={i}>
              {row.map((f) => (
                <AdvFilterGroup key={f.key} label={f.label} span={f.span} breakBefore={f.breakBefore}>
                  {renderAdvancedFilterControl(f)}
                </AdvFilterGroup>
              ))}
            </AdvFilterRow>
          ))}
        </AdvancedFilters>
      )}

      {config.columnToggle && (
        <div className="flex" style={{ justifyContent: 'flex-end', margin: '8px 0' }}>
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="default" size="sm">
                <Columns3 size={13} /> {t('table_columns', 'Kolonlar')}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" style={{ width: 220 }}>
              <ColumnVisibilityPanel
                columns={toggleableColumns}
                visibility={columnVisibility}
                onChange={(id, visible) =>
                  setColumnVisibility((prev) => ({ ...prev, [id]: visible }))
                }
              />
            </PopoverContent>
          </Popover>
        </div>
      )}

      {config.selectable && (
        <BulkBar
          count={selectedCount}
          label={`${fmtCount(selectedCount, locale)} ${t('bulk_selected', 'kayıt seçili')}`}
          actions={
            <>
              {(config.bulkActions ?? []).map((b) => (
                <Button
                  key={b.key}
                  type="button"
                  variant={b.variant === 'danger' ? 'danger' : 'default'}
                  size="sm"
                  onClick={() => void handleBulkAction(b)}
                >
                  {b.label}
                </Button>
              ))}
              <Button type="button" variant="ghost" size="sm" onClick={() => setRowSelection({})}>
                <X size={12} /> {t('bulk_clear', 'Seçimi temizle')}
              </Button>
            </>
          }
        />
      )}

      <DataGrid
        mode="server"
        data={data}
        columns={columns}
        enableSelection={config.selectable}
        rowSelection={config.selectable ? rowSelection : undefined}
        onRowSelectionChange={config.selectable ? setRowSelection : undefined}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        sorting={sorting}
        onSortingChange={handleSortingChange}
        totalCount={total}
        isLoading={loading}
        pagination
        paginationLabels={paginationLabels}
        pageSize={pageSize}
        pageSizeOptions={(config.pagination || undefined)?.pageSizeOptions ?? [10, 20, 50, 100]}
        pageIndex={pageIndex}
        onPageChange={setPageIndex}
        onPageSizeChange={(s) => {
          setPageSize(s);
          setPageIndex(0);
        }}
        columnFilters={columnFilterCfg ? columnFilters : undefined}
        onColumnFilterChange={columnFilterCfg ? handleColumnFilterChange : undefined}
        columnFilterConfig={columnFilterCfg}
        onRowClick={onRowClick}
        getRowId={getRowId}
        emptyState={
          <div className="empty-state" style={{ padding: 32 }}>
            <p className="t-mute fs-12">{t('table_empty', 'Kayıt bulunamadı')}</p>
          </div>
        }
      />
      </div>
    </div>
  );
}
