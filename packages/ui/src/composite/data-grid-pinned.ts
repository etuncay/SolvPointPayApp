/** Sol tarafta yatay scroll sırasında sabit kalan kolonlar */
export const PINNED_LEFT_COLUMN_IDS = new Set(['select', 'expand', 'actions']);

export function getPinnedLeftStyle(
  columnId: string,
  leafColumns: { id: string; getSize: () => number }[],
): { left: number; isEdge: boolean } | null {
  if (!PINNED_LEFT_COLUMN_IDS.has(columnId)) return null;

  let left = 0;
  for (const col of leafColumns) {
    if (col.id === columnId) {
      const pinnedVisible = leafColumns.filter((c) => PINNED_LEFT_COLUMN_IDS.has(c.id));
      const lastPinnedId = pinnedVisible[pinnedVisible.length - 1]?.id;
      return { left, isEdge: columnId === lastPinnedId };
    }
    if (PINNED_LEFT_COLUMN_IDS.has(col.id)) {
      left += col.getSize();
    }
  }
  return null;
}

export function pinnedColumnClass(columnId: string): string | false {
  if (columnId === 'actions') return 'actions-th';
  if (columnId === 'select') return 'cb';
  return false;
}

export function pinnedBodyClass(columnId: string): string | false {
  if (columnId === 'actions') return 'actions-td';
  if (columnId === 'select') return 'cb';
  return false;
}
