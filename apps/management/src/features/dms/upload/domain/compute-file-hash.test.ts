import { describe, expect, it } from 'vitest';
import { hashArrayBuffer } from './compute-file-hash';

describe('compute-file-hash', () => {
  it('produces known SHA-256 for empty buffer', async () => {
    const hash = await hashArrayBuffer(new ArrayBuffer(0));
    expect(hash).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    );
  });

  it('produces deterministic hash for hello', async () => {
    const enc = new TextEncoder();
    const hash = await hashArrayBuffer(enc.encode('hello').buffer);
    expect(hash).toBe(
      '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
    );
  });
});
