import { describe, expect, it } from 'vitest';
import { getIntegrationActions } from './integration-action-permissions';

describe('integration-action-permissions', () => {
  it('Completed → yalnızca view', () => {
    expect(getIntegrationActions('Completed')).toEqual({
      view: true,
      retry: false,
      hold: false,
      cancel: false,
    });
  });

  it('ErrorData → tüm aksiyonlar', () => {
    expect(getIntegrationActions('ErrorData')).toEqual({
      view: true,
      retry: true,
      hold: true,
      cancel: true,
    });
  });
});
