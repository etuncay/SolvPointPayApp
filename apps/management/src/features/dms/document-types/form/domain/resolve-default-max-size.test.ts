import { describe, expect, it } from 'vitest';
import { DEFAULT_MAX_FILE_SIZE_MB } from '@/mocks/document-upload-params';
import { parseMaxFileSizeInput, resolveDefaultMaxSizeMb } from './resolve-default-max-size';

describe('resolve-default-max-size', () => {
  it('null → default 10 MB', () => {
    expect(resolveDefaultMaxSizeMb(null)).toBe(DEFAULT_MAX_FILE_SIZE_MB);
    expect(parseMaxFileSizeInput('')).toBeNull();
    expect(resolveDefaultMaxSizeMb(parseMaxFileSizeInput(''))).toBe(10);
  });

  it('explicit value preserved', () => {
    expect(resolveDefaultMaxSizeMb(15)).toBe(15);
    expect(parseMaxFileSizeInput('15')).toBe(15);
  });
});
