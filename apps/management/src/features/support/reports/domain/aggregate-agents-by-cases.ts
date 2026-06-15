import type { SupportCase } from '../../domain/types';
import { resolveAgentDisplay } from './entity-resolve';
import type { EntityCaseReportRow } from './types';
import { computeMonthlyAvgVolumeTry } from './monthly-tx-volume';

export function aggregateAgentsByCases(
  cases: SupportCase[],
  at: Date = new Date('2026-05-24T12:00:00Z'),
): EntityCaseReportRow[] {
  const byKey = new Map<string, { row: EntityCaseReportRow; caseCount: number }>();

  for (const c of cases) {
    if (c.requesterType !== 'Agent') continue;
    const key = c.requesterId.trim();
    if (!key) continue;
    const resolved = resolveAgentDisplay(key);
    const existing = byKey.get(key);
    if (existing) {
      existing.caseCount += 1;
      existing.row.caseCount = existing.caseCount;
    } else {
      const agentNo = resolved.agentNo;
      byKey.set(key, {
        caseCount: 1,
        row: {
          entityNo: agentNo,
          displayName: resolved.displayName,
          riskScore: resolved.riskScore,
          monthlyAvgVolumeTry: computeMonthlyAvgVolumeTry(
            agentNo.replace(/^AG-/i, ''),
            'agent',
            at,
          ),
          caseCount: 1,
        },
      });
    }
  }

  return [...byKey.values()]
    .map((e) => e.row)
    .sort((a, b) => b.caseCount - a.caseCount || a.displayName.localeCompare(b.displayName));
}
