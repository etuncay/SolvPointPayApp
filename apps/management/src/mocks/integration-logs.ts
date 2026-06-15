import { maskPayloadJson } from '@/features/system/integrations/domain/mask-payload';
import type { IntegrationLogEntry } from '@/features/system/integrations/domain/types';

const CORR = 'corr-acct-20260525-001';

function seedLogs(): IntegrationLogEntry[] {
  const mk = (
    id: string,
    integrationId: string,
    operation: string,
    offsetMin: number,
    outcome: IntegrationLogEntry['outcome'],
    retry: number,
    req: Record<string, unknown>,
    res: Record<string, unknown>,
  ): IntegrationLogEntry => {
    const reqStr = JSON.stringify(req);
    const resStr = JSON.stringify(res);
    const t0 = new Date('2026-05-25T10:00:00Z');
    t0.setMinutes(t0.getMinutes() + offsetMin);
    const t1 = new Date(t0);
    t1.setMilliseconds(t1.getMilliseconds() + 420);
    return {
      id,
      integrationId,
      correlationId: CORR,
      operation,
      requestTime: t0.toISOString(),
      responseTime: t1.toISOString(),
      durationMs: 420,
      outcome,
      retryCount: retry,
      requestPath: `/api/${operation}`,
      requestMasked: maskPayloadJson(reqStr),
      responseMasked: maskPayloadJson(resStr),
      requestFull: reqStr,
      responseFull: resStr,
      logSource: 'runtime',
    };
  };
  return [
    mk('ilog-0001', 'int-001', 'create', 0, 'Success', 0, { voucherType: 'Payment', apiKey: 'secret-x' }, { ok: true }),
    mk('ilog-0002', 'int-001', 'inquiry', 1, 'Success', 0, { ref: 'ACC-001' }, { status: 'Pending' }),
    mk('ilog-0003', 'int-001', 'callback', 2, 'Success', 0, { ref: 'ACC-001' }, { status: 'Completed' }),
    mk('ilog-0004', 'int-002', 'submit', 0, 'Failure', 1, { reportId: 'BTR-1', token: 'abc' }, { error: 'timeout' }),
  ];
}

let logs: IntegrationLogEntry[] = seedLogs();

export function resetIntegrationLogs(): void {
  logs = seedLogs();
}

export function getIntegrationLogs(integrationId?: string): IntegrationLogEntry[] {
  const rows = integrationId ? logs.filter((l) => l.integrationId === integrationId) : [...logs];
  return rows.sort((a, b) => b.requestTime.localeCompare(a.requestTime));
}
