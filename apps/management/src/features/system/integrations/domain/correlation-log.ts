import type { IntegrationLogEntry } from './types';

export function filterLogsByCorrelation(
  logs: IntegrationLogEntry[],
  correlationId: string | null,
): IntegrationLogEntry[] {
  if (!correlationId?.trim()) return logs;
  const id = correlationId.trim();
  return logs.filter((l) => l.correlationId === id);
}
