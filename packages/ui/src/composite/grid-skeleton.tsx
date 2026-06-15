import * as React from 'react';
import { Skeleton } from '../primitives/skeleton';

/** Satır yüksekliği — gerçek data-grid satırları ile hizalı (layout shift önlenir) */
export const GRID_SKELETON_ROW_PX = 44;

const BAR_WIDTHS = ['38%', '92%', '85%', '52%', '78%', '64%', '88%', '46%'];

export function GridSkeleton({
  rowCount,
  colCount,
}: {
  rowCount: number;
  colCount: number;
}) {
  return (
    <>
      {Array.from({ length: Math.max(0, rowCount) }).map((_, r) => (
        <tr key={`sk-${r}`} className="grid-skel-row" aria-hidden>
          {Array.from({ length: Math.max(0, colCount) }).map((__, c) => (
            <td key={`sk-${r}-${c}`}>
              <Skeleton
                className="grid-skel-bar"
                style={{
                  height: 10,
                  width: BAR_WIDTHS[(r + c) % BAR_WIDTHS.length],
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

