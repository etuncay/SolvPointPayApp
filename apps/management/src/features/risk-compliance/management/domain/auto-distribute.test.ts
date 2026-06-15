import { describe, expect, it } from 'vitest';
import { pickMemberByWorkload } from './auto-distribute';

describe('pickMemberByWorkload', () => {
  it('picks lowest workload', () => {
    const id = pickMemberByWorkload(
      [{ userId: 'a' }, { userId: 'b' }, { userId: 'c' }],
      { a: 5, b: 2, c: 8 },
    );
    expect(id).toBe('b');
  });

  it('equal workload — first member', () => {
    const id = pickMemberByWorkload([{ userId: 'a' }, { userId: 'b' }], { a: 1, b: 1 });
    expect(id).toBe('a');
  });
});
