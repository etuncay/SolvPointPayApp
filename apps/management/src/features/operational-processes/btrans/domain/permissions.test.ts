import { describe, expect, it } from 'vitest';
import { getBtransPermissions } from './permissions';

describe('getBtransPermissions', () => {
  it('grants finance full access', () => {
    expect(getBtransPermissions('finance')).toEqual({
      list: true,
      view: true,
      retry: true,
      hold: true,
      cancel: true,
    });
  });

  it('grants compliance full access', () => {
    expect(getBtransPermissions('compliance')).toEqual({
      list: true,
      view: true,
      retry: true,
      hold: true,
      cancel: true,
    });
  });

  it('denies ops role', () => {
    expect(getBtransPermissions('ops').list).toBe(false);
  });
});
