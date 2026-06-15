import { describe, expect, it } from 'vitest';
import { mockDashboardAdapter } from './mock-dashboard-adapter';

describe('mockDashboardAdapter', () => {
  it('management snapshot widget verisi döner', async () => {
    const snap = await mockDashboardAdapter.refreshAll('management', 0);
    expect(snap.data.my_approvals.length).toBeGreaterThanOrEqual(0);
    expect(snap.data.sys_health.successRate).toBeGreaterThan(0);
  });

  it('her 3. refreshte sys_health hata simüle eder', async () => {
    const snap = await mockDashboardAdapter.refreshAll('management', 3);
    expect(snap.errors.sys_health).toBe('SERVICE_UNAVAILABLE');
  });

  it('getWidget tek widget verisi döner', async () => {
    const widget = await mockDashboardAdapter.getWidget('ops', 'pending_xfer', 0);
    expect(widget.data).not.toBeNull();
    expect(Array.isArray(widget.data)).toBe(true);
  });

  it('transfer widgetları mutual exclusion uygular', async () => {
    const snap = await mockDashboardAdapter.refreshAll('ops', 0);
    const pendingIds = new Set(snap.data.pending_xfer.map((r) => r.id));
    const amlIds = new Set(snap.data.aml_held.map((r) => r.id));
    for (const id of pendingIds) {
      expect(amlIds.has(id)).toBe(false);
    }
  });
});
