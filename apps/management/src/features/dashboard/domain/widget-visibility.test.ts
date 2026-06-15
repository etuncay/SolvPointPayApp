import { describe, expect, it } from 'vitest';
import { ALL_WIDGETS } from '../widget-registry';
import { resolveVisibleWidgets } from './widget-visibility';

describe('resolveVisibleWidgets', () => {
  it('management tüm görünür widgetları full detail ile alır', () => {
    const visible = resolveVisibleWidgets('management', ALL_WIDGETS);
    expect(visible.length).toBeGreaterThan(5);
    expect(visible.every((w) => w.detailLevel === 'full')).toBe(true);
  });

  it('finance pending_xfer görmez', () => {
    const visible = resolveVisibleWidgets('finance', ALL_WIDGETS);
    expect(visible.some((w) => w.id === 'pending_xfer')).toBe(false);
    expect(visible.some((w) => w.id === 'daily_volume')).toBe(true);
  });
});
