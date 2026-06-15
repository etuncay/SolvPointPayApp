import * as React from 'react';
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ExpandedState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table';
import { ChevronDown } from 'lucide-react';
import { Checkbox } from '../primitives/checkbox';
import { cn } from '../lib/utils';
import { Pagination, type PaginationLabels } from '../primitives/pagination';
import { GRID_SKELETON_ROW_PX, GridSkeleton } from './grid-skeleton';
import {
  getPinnedLeftStyle,
  pinnedBodyClass,
  pinnedColumnClass,
} from './data-grid-pinned';

export type ColumnFilterConfig =
  | { type: 'text'; placeholder?: string }
  | { type: 'select'; placeholder?: string; options: { value: string; label: string }[] }
  | { type: 'date-range'; placeholder?: [string, string] }
  | { type: 'number-range'; placeholder?: [string, string] }
  | { type: 'multi-select'; options: { value: string; label: string }[] };

export type DataGridMode = 'client' | 'server';

/**
 * Server-side kullanım kalıbı.
 *
 * Amaç: sayfa/feature tarafında query-state'i tek kaynak yapmak, DataGrid'i kontrollü sürmek.
 *
 * ```tsx
 * const [pageIndex, setPageIndex] = useState(0)
 * const [pageSize, setPageSize] = useState(20)
 * const [sorting, setSorting] = useState<SortingState>([])
 * const [filters, setFilters] = useState<Record<string, string>>({})
 *
 * const { data, totalCount, isFetching } = useCustomersQuery({
 *   pageIndex,
 *   pageSize,
 *   sorting,
 *   filters,
 * })
 *
 * <DataGrid
 *   mode="server"
 *   data={data}
 *   columns={columns}
 *   sorting={sorting}
 *   onSortingChange={setSorting}
 *   totalCount={totalCount}
 *   isLoading={isFetching}
 *   pagination
 *   pageSize={pageSize}
 *   pageIndex={pageIndex}
 *   onPageChange={setPageIndex}
 *   onPageSizeChange={setPageSize}
 *   columnFilters={filters}
 *   onColumnFilterChange={(id, v) => setFilters((p) => ({ ...p, [id]: v }))}
 * />
 * ```
 */
export function DataGrid<T>({
  mode = 'client',
  data,
  columns,
  onRowClick,
  enableSelection = false,
  rowSelection,
  onRowSelectionChange,
  sorting,
  onSortingChange,
  columnVisibility,
  onColumnVisibilityChange,
  minWidth = 1280,
  getRowId,
  className,
  pagination = false,
  pageSize = 20,
  pageSizeOptions = [10, 20, 50, 100],
  paginationLabels,
  totalCount,
  pageIndex,
  onPageChange,
  onPageSizeChange,
  isLoading,
  emptyState,
  columnFilters,
  onColumnFilterChange,
  columnFilterConfig,
  expandable,
}: {
  /** `client`: tüm veri bellekte, sayfalama/sıralama local. `server`: manualPagination/manualSorting/manualFiltering. */
  mode?: DataGridMode;
  data: T[];
  columns: ColumnDef<T, unknown>[];
  onRowClick?: (row: T) => void;
  enableSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: (s: RowSelectionState) => void;
  sorting?: SortingState;
  onSortingChange?: (s: SortingState) => void;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: (s: VisibilityState) => void;
  minWidth?: number;
  getRowId?: (row: T) => string;
  className?: string;
  /** true ise tablonun altında sayfalama kontrolleri gösterilir */
  pagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  paginationLabels?: PaginationLabels;
  /** `mode="server"` iken tüm kayıt sayısı (sayfalama hesapları için) */
  totalCount?: number;
  /** `mode="server"` iken kontrollü sayfa index'i */
  pageIndex?: number;
  /** `mode="server"` iken sayfa değişim handler'ı */
  onPageChange?: (pageIndex: number) => void;
  /** `mode="server"` iken pageSize değişim handler'ı */
  onPageSizeChange?: (pageSize: number) => void;
  /** `mode="server"` iken fetch/transition loading state'i */
  isLoading?: boolean;
  /** Veri yoksa gösterilecek içerik */
  emptyState?: React.ReactNode;
  /** Kolon bazlı arama — ikinci header satırı */
  columnFilters?: Record<string, string>;
  onColumnFilterChange?: (columnId: string, value: string) => void;
  columnFilterConfig?: Record<string, ColumnFilterConfig>;
  expandable?: {
    renderExpanded: (row: { original: T }) => React.ReactNode;
    expandOnRowClick?: boolean;
  };
}) {
  const [internalSort, setInternalSort] = React.useState<SortingState>([]);
  const [internalSel, setInternalSel] = React.useState<RowSelectionState>({});
  const [internalVis, setInternalVis] = React.useState<VisibilityState>({});
  const [expanded, setExpanded] = React.useState<ExpandedState>({});
  const [pageState, setPageState] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  React.useEffect(() => {
    setPageState((p) => ({ ...p, pageSize }));
  }, [pageSize]);

  React.useEffect(() => {
    if (mode === 'server' && pageIndex != null) {
      setPageState((p) => (p.pageIndex === pageIndex ? p : { ...p, pageIndex }));
    }
  }, [mode, pageIndex]);

  const effectivePageIndex = mode === 'server' && pageIndex != null ? pageIndex : pageState.pageIndex;
  const effectivePaginationState: PaginationState = {
    pageIndex: effectivePageIndex,
    pageSize: pageState.pageSize,
  };

  const effectiveTotalCount =
    mode === 'server' ? (totalCount ?? 0) : undefined;

  const effectiveColumns = React.useMemo(() => {
    if (!expandable) return columns;

    const expandCol: ColumnDef<T, unknown> = {
      id: 'expand',
      header: () => null,
      cell: ({ row }) => (
        <button
          type="button"
          className="page-btn"
          style={{ width: 26, height: 26 }}
          onClick={(e) => {
            e.stopPropagation();
            row.toggleExpanded();
          }}
          aria-label={row.getIsExpanded() ? 'Satırı daralt' : 'Satırı genişlet'}
        >
          <ChevronDown
            size={14}
            className={cn('transition-transform', row.getIsExpanded() && 'rotate-180')}
          />
        </button>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 38,
    };

    const idx = columns.findIndex((c) => c.id === 'actions');
    if (idx >= 0) {
      const next = [...columns];
      next.splice(idx, 0, expandCol);
      return next;
    }
    return [expandCol, ...columns];
  }, [columns, expandable]);

  const table = useReactTable({
    data,
    columns: effectiveColumns,
    state: {
      sorting: sorting ?? internalSort,
      rowSelection: rowSelection ?? internalSel,
      columnVisibility: columnVisibility ?? internalVis,
      expanded,
      ...(pagination ? { pagination: effectivePaginationState } : {}),
    },
    onSortingChange: (u) => {
      const next = typeof u === 'function' ? u(sorting ?? internalSort) : u;
      onSortingChange?.(next);
      setInternalSort(next);
    },
    onRowSelectionChange: (u) => {
      const next = typeof u === 'function' ? u(rowSelection ?? internalSel) : u;
      onRowSelectionChange?.(next);
      setInternalSel(next);
    },
    onColumnVisibilityChange: (u) => {
      const next = typeof u === 'function' ? u(columnVisibility ?? internalVis) : u;
      onColumnVisibilityChange?.(next);
      setInternalVis(next);
    },
    onPaginationChange: (u) => {
      const next = typeof u === 'function' ? u(effectivePaginationState) : u;
      setPageState((prev) => ({ ...prev, pageSize: next.pageSize, pageIndex: next.pageIndex }));

      if (mode === 'server') {
        if (next.pageIndex !== effectivePageIndex) onPageChange?.(next.pageIndex);
        if (next.pageSize !== pageState.pageSize) onPageSizeChange?.(next.pageSize);
      }
    },
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    ...(pagination && mode === 'client' ? { getPaginationRowModel: getPaginationRowModel() } : {}),
    ...(mode === 'server'
      ? {
          manualPagination: true,
          manualSorting: true,
          manualFiltering: true,
          pageCount:
            pagination && pageState.pageSize > 0 && effectiveTotalCount != null
              ? Math.max(1, Math.ceil(effectiveTotalCount / pageState.pageSize))
              : -1,
        }
      : {}),
    enableRowSelection: enableSelection,
    /** Sunucu sayfalamada veri yenilenince sayfa sıfırlanmasın (parent pageIndex kontrol eder) */
    autoResetPageIndex: mode !== 'server',
    getExpandedRowModel: expandable ? getExpandedRowModel() : undefined,
    getRowCanExpand: expandable ? () => true : undefined,
    getRowId: getRowId as (row: T) => string,
  });

  const rows = table.getRowModel().rows;
  const colCount = table.getVisibleLeafColumns().length;
  const leafColumns = table.getVisibleLeafColumns();

  const pinnedStyleFor = (columnId: string) => getPinnedLeftStyle(columnId, leafColumns);

  const currentPageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();
  const totalRows =
    mode === 'server'
      ? (effectiveTotalCount ?? 0)
      : table.getFilteredRowModel().rows.length;

  const hasColumnFilters =
    columnFilterConfig != null && Object.keys(columnFilterConfig).length > 0;

  const skeletonRowCount = pagination ? effectivePaginationState.pageSize : 0;
  const bodyMinHeight =
    isLoading && pagination && skeletonRowCount > 0
      ? skeletonRowCount * GRID_SKELETON_ROW_PX
      : undefined;

  return (
    <div className={cn('grid-card', className)}>
      <div
        className={cn('data-grid-wrap', isLoading && pagination && 'data-grid-wrap--loading')}
        style={bodyMinHeight != null ? { minHeight: bodyMinHeight } : undefined}
      >
        <table className="data-grid" style={{ minWidth }}>
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => {
                  const pinned = pinnedStyleFor(h.column.id);
                  return (
                  <th
                    key={h.id}
                    className={cn(
                      (h.column.columnDef.meta as { align?: string })?.align === 'right' && 'r',
                      (h.column.columnDef.meta as { align?: string })?.align === 'center' && 'c',
                      pinnedColumnClass(h.column.id),
                      pinned && 'sticky-col',
                      pinned?.isEdge && 'sticky-col-edge',
                      h.column.getIsSorted() && 'sorted',
                    )}
                    style={pinned ? { left: pinned.left } : undefined}
                    onClick={h.column.getCanSort() ? h.column.getToggleSortingHandler() : undefined}
                  >
                    {h.isPlaceholder ? null : (
                      <span className="th-content">
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {h.column.getCanSort() && (
                          <span className="sort-ind">
                            {h.column.getIsSorted() === 'asc'
                              ? '↑'
                              : h.column.getIsSorted() === 'desc'
                                ? '↓'
                                : '⇅'}
                          </span>
                        )}
                      </span>
                    )}
                  </th>
                  );
                })}
              </tr>
            ))}
            {hasColumnFilters && (
              <tr className="col-filter-row">
                {table.getVisibleLeafColumns().map((col) => {
                  const pinned = pinnedStyleFor(col.id);
                  const cfg = columnFilterConfig?.[col.id];
                  if (!cfg) {
                    return (
                      <th
                        key={`filter-${col.id}`}
                        className={cn('col-filter-th', pinned && 'sticky-col', pinned?.isEdge && 'sticky-col-edge')}
                        style={pinned ? { left: pinned.left } : undefined}
                      >
                        <span
                          style={{
                            position: 'absolute',
                            width: 1,
                            height: 1,
                            padding: 0,
                            margin: -1,
                            overflow: 'hidden',
                            clip: 'rect(0, 0, 0, 0)',
                            whiteSpace: 'nowrap',
                            borderWidth: 0,
                          }}
                        >
                          Filter
                        </span>
                      </th>
                    );
                  }
                  const value = columnFilters?.[col.id] ?? '';
                  if (cfg.type === 'select') {
                    return (
                      <th
                        key={`filter-${col.id}`}
                        className={cn('col-filter-th', pinned && 'sticky-col', pinned?.isEdge && 'sticky-col-edge')}
                        style={pinned ? { left: pinned.left } : undefined}
                      >
                        <select
                          className="col-filter-input select"
                          value={value}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => onColumnFilterChange?.(col.id, e.target.value)}
                        >
                          <option value="">{cfg.placeholder ?? '—'}</option>
                          {cfg.options?.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </th>
                    );
                  }
                  if (cfg.type === 'multi-select') {
                    const selected = value ? value.split(',').filter(Boolean) : [];
                    return (
                      <th
                        key={`filter-${col.id}`}
                        className={cn('col-filter-th', pinned && 'sticky-col', pinned?.isEdge && 'sticky-col-edge')}
                        style={pinned ? { left: pinned.left } : undefined}
                      >
                        <select
                          className="col-filter-input select"
                          multiple
                          value={selected}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            const next = Array.from(e.currentTarget.selectedOptions).map((o) => o.value);
                            onColumnFilterChange?.(col.id, next.join(','));
                          }}
                        >
                          {cfg.options?.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </th>
                    );
                  }
                  if (cfg.type === 'date-range' || cfg.type === 'number-range') {
                    const [a, b] = value.split('..');
                    const inputType = cfg.type === 'date-range' ? 'date' : 'number';
                    const [phA, phB] = cfg.placeholder ?? ['', ''];
                    return (
                      <th
                        key={`filter-${col.id}`}
                        className={cn('col-filter-th', pinned && 'sticky-col', pinned?.isEdge && 'sticky-col-edge')}
                        style={pinned ? { left: pinned.left } : undefined}
                      >
                        <div style={{ display: 'flex', gap: 6 }}>
                          <input
                            type={inputType}
                            className="col-filter-input input"
                            placeholder={phA}
                            value={a ?? ''}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => onColumnFilterChange?.(col.id, `${e.target.value}..${b ?? ''}`)}
                          />
                          <input
                            type={inputType}
                            className="col-filter-input input"
                            placeholder={phB}
                            value={b ?? ''}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => onColumnFilterChange?.(col.id, `${a ?? ''}..${e.target.value}`)}
                          />
                        </div>
                      </th>
                    );
                  }
                  return (
                    <th
                      key={`filter-${col.id}`}
                      className={cn('col-filter-th', pinned && 'sticky-col', pinned?.isEdge && 'sticky-col-edge')}
                      style={pinned ? { left: pinned.left } : undefined}
                    >
                      <input
                        type="text"
                        className="col-filter-input input"
                        placeholder={cfg.placeholder}
                        value={value}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => onColumnFilterChange?.(col.id, e.target.value)}
                      />
                    </th>
                  );
                })}
              </tr>
            )}
          </thead>
          <tbody
            className={cn(isLoading && pagination && 'data-grid-body--loading')}
            style={
              bodyMinHeight != null
                ? ({ minHeight: bodyMinHeight } as React.CSSProperties)
                : undefined
            }
          >
            {isLoading && pagination && (
              <GridSkeleton rowCount={skeletonRowCount} colCount={colCount} />
            )}
            {isLoading && !pagination && (
              <GridSkeleton rowCount={8} colCount={colCount} />
            )}
            {rows.length === 0 && emptyState != null && !isLoading && (
              <tr>
                <td colSpan={colCount} style={{ height: 'auto', whiteSpace: 'normal' }}>
                  {emptyState}
                </td>
              </tr>
            )}
            {!isLoading &&
              rows.map((row) => (
                <React.Fragment key={row.id}>
                  <tr
                    className={cn(row.getIsSelected() && 'selected')}
                    onClick={() => {
                      if (expandable?.expandOnRowClick) row.toggleExpanded();
                      onRowClick?.(row.original);
                    }}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const pinned = pinnedStyleFor(cell.column.id);
                      return (
                      <td
                        key={cell.id}
                        className={cn(
                          (cell.column.columnDef.meta as { align?: string })?.align === 'right' && 'r',
                          pinnedBodyClass(cell.column.id),
                          pinned && 'sticky-col',
                          pinned?.isEdge && 'sticky-col-edge',
                        )}
                        style={pinned ? { left: pinned.left } : undefined}
                        onClick={(e) => {
                          if (
                            cell.column.id === 'select' ||
                            cell.column.id === 'actions' ||
                            cell.column.id === 'expand'
                          )
                            e.stopPropagation();
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                      );
                    })}
                  </tr>
                  {expandable && row.getIsExpanded() && (
                    <tr>
                      <td colSpan={colCount} style={{ height: 'auto', whiteSpace: 'normal' }}>
                        {expandable.renderExpanded({ original: row.original })}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
          </tbody>
        </table>
      </div>
      {pagination && paginationLabels && (
        <Pagination
          pageIndex={currentPageIndex}
          pageCount={pageCount}
          pageSize={pageState.pageSize}
          pageSizeOptions={pageSizeOptions}
          totalCount={totalRows}
          onPageChange={(idx) => table.setPageIndex(idx)}
          onPageSizeChange={(size) => table.setPageSize(size)}
          labels={paginationLabels}
        />
      )}
    </div>
  );
}

export function SelectColumn<T>(): ColumnDef<T, unknown> {
  return {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected()
            ? true
            : table.getIsSomePageRowsSelected()
              ? 'indeterminate'
              : false
        }
        onCheckedChange={(v: boolean | 'indeterminate') => table.toggleAllPageRowsSelected(!!v)}
        aria-label="Tümünü seç"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v: boolean | 'indeterminate') => row.toggleSelected(!!v)}
        aria-label="Satır seç"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 38,
  };
}
