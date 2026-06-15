import * as React from 'react';
import { cn } from '../lib/utils';

export type PaginationLabels = {
  rowsPerPage: string;
  /** "X–Y / Z" arasındaki ayraç (ör. "/" veya "of") */
  of: string;
  /** Eski sayfalarda sadece "page" kullananlar olabiliyor */
  page?: string;
  first?: string;
  prev?: string;
  next?: string;
  last?: string;
};

export function Pagination({
  pageIndex,
  pageCount,
  pageSize,
  pageSizeOptions,
  totalCount,
  onPageChange,
  onPageSizeChange,
  labels,
  className,
}: {
  pageIndex: number;
  pageCount: number;
  pageSize: number;
  pageSizeOptions: number[];
  totalCount: number;
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  labels: PaginationLabels;
  className?: string;
}) {
  const l = {
    first: labels.first ?? 'İlk',
    prev: labels.prev ?? 'Önceki',
    next: labels.next ?? 'Sonraki',
    last: labels.last ?? 'Son',
    rowsPerPage: labels.rowsPerPage,
    of: labels.of,
  };
  const clampedPageCount = Math.max(1, pageCount);
  const current = Math.max(0, Math.min(pageIndex, clampedPageCount - 1));

  const rangeStart = totalCount === 0 ? 0 : current * pageSize + 1;
  const rangeEnd = Math.min((current + 1) * pageSize, totalCount);

  const canPrev = current > 0;
  const canNext = current < clampedPageCount - 1;

  const pageNumbers = React.useMemo(() => {
    const start = Math.max(0, Math.min(current - 2, clampedPageCount - 5));
    const end = Math.min(clampedPageCount - 1, start + 4);
    const list: number[] = [];
    for (let p = start; p <= end; p++) list.push(p);
    return list;
  }, [current, clampedPageCount]);

  return (
    <div className={cn('pagination', className)}>
      <span>{labels.rowsPerPage}</span>
      <select
        className="select"
        style={{ width: 64, height: 26, padding: '0 6px' }}
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
      >
        {pageSizeOptions.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
      <span className="t-mute" style={{ marginLeft: 14 }}>
        {rangeStart}–{rangeEnd} {labels.of} {totalCount}
      </span>
      <div className="right">
        <button
          type="button"
          className="page-btn"
          disabled={!canPrev}
          onClick={() => onPageChange(0)}
          title={l.first}
        >
          «
        </button>
        <button
          type="button"
          className="page-btn"
          disabled={!canPrev}
          onClick={() => onPageChange(current - 1)}
          title={l.prev}
        >
          ‹
        </button>
        {pageNumbers.map((p) => (
          <button
            key={p}
            type="button"
            className={cn('page-btn', p === current && 'on')}
            onClick={() => onPageChange(p)}
          >
            {p + 1}
          </button>
        ))}
        <button
          type="button"
          className="page-btn"
          disabled={!canNext}
          onClick={() => onPageChange(current + 1)}
          title={l.next}
        >
          ›
        </button>
        <button
          type="button"
          className="page-btn"
          disabled={!canNext}
          onClick={() => onPageChange(clampedPageCount - 1)}
          title={l.last}
        >
          »
        </button>
      </div>
    </div>
  );
}

