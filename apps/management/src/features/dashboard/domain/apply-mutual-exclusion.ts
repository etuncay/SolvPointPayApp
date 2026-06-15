import type { TransferRow, WidgetCode, WidgetDataMap } from './types';
import { PENDING_WIDGET_PRIORITY, TRANSFER_WIDGETS } from './types';

/** TRX kimliklerini öncelik sırasına göre tek widget'ta bırakır. */
export function applyMutualExclusion(raw: WidgetDataMap): WidgetDataMap {
  const claimedTrx = new Set<string>();
  const next = { ...raw };

  for (const code of PENDING_WIDGET_PRIORITY) {
    if (!TRANSFER_WIDGETS.has(code)) continue;
    const rows = next[code] as TransferRow[];
    const kept: TransferRow[] = [];
    for (const row of rows) {
      if (claimedTrx.has(row.id)) continue;
      kept.push(row);
      claimedTrx.add(row.id);
    }
    (next as Record<string, unknown>)[code] = kept;
  }

  return next;
}
