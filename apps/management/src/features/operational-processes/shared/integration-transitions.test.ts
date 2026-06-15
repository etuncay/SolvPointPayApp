import { describe, expect, it } from 'vitest';
import {
  applyCancel,
  applyHold,
  applyRetry,
  canCancel,
  canHold,
  canRetry,
} from './integration-transitions';
import { getIntegrationActions } from './integration-action-permissions';

describe('integration-transitions', () => {
  it('ErrorSend allows retry, hold, cancel', () => {
    expect(canRetry('ErrorSend')).toBe(true);
    expect(canHold('ErrorSend')).toBe(true);
    expect(canCancel('ErrorSend')).toBe(true);
    expect(applyRetry('ErrorSend')).toBe('Retrying');
    expect(applyHold('ErrorSend')).toBe('OnHold');
    expect(applyCancel('ErrorSend')).toBe('Canceled');
  });

  it('OnHold allows retry and cancel only', () => {
    expect(canRetry('OnHold')).toBe(true);
    expect(canHold('OnHold')).toBe(false);
    expect(canCancel('OnHold')).toBe(true);
  });

  it('Completed allows view only', () => {
    const actions = getIntegrationActions('Completed');
    expect(actions).toEqual({ view: true, retry: false, hold: false, cancel: false });
  });
});
