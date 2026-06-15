import { describe, expect, it } from 'vitest';
import { applyMutualExclusion } from './apply-mutual-exclusion';
import type { WidgetDataMap } from './types';

describe('applyMutualExclusion', () => {
  it('aynı TRX yalnızca yüksek öncelikli widgetta kalır', () => {
    const raw = {
      my_approvals: [],
      pending_xfer: [
        {
          id: 'TRX-1',
          customer: 'A',
          amount: 100,
          state: 'pending',
          age: 1,
        },
      ],
      kyc_manual: [],
      aml_held: [
        {
          id: 'TRX-1',
          customer: 'A',
          amount: 100,
          state: 'held',
          age: 2,
          rule: 'AML',
        },
      ],
      rejected: [],
      daily_volume: [],
      new_customers: [],
      top_customers: [],
      top_agents: [],
      sys_health: {
        successRate: 99,
        p95: 1,
        p99: 2,
        errorRate: 0.1,
        topErrors: [],
      },
    } as WidgetDataMap;

    const next = applyMutualExclusion(raw);
    expect((next.aml_held as { id: string }[]).map((r) => r.id)).toEqual(['TRX-1']);
    expect((next.pending_xfer as { id: string }[])).toHaveLength(0);
  });
});
