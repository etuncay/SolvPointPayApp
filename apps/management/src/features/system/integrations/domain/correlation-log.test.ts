import { describe, expect, it } from 'vitest';
import { filterLogsByCorrelation } from './correlation-log';
import type { IntegrationLogEntry } from './types';

const logs: IntegrationLogEntry[] = [
  {
    id: '1',
    integrationId: 'int-001',
    correlationId: 'corr-a',
    operation: 'create',
    requestTime: '',
    responseTime: null,
    durationMs: 1,
    outcome: 'Success',
    retryCount: 0,
    requestPath: '/',
    requestMasked: '',
    responseMasked: '',
    requestFull: '{}',
    responseFull: '{}',
    logSource: 't',
  },
  {
    id: '2',
    integrationId: 'int-001',
    correlationId: 'corr-b',
    operation: 'x',
    requestTime: '',
    responseTime: null,
    durationMs: 1,
    outcome: 'Success',
    retryCount: 0,
    requestPath: '/',
    requestMasked: '',
    responseMasked: '',
    requestFull: '{}',
    responseFull: '{}',
    logSource: 't',
  },
];

describe('filterLogsByCorrelation', () => {
  it('filters by correlation id', () => {
    expect(filterLogsByCorrelation(logs, 'corr-a')).toHaveLength(1);
  });
});
