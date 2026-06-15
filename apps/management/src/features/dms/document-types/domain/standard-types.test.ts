import { describe, expect, it } from 'vitest';
import { STANDARD_CATEGORIES, STANDARD_DOCUMENT_TYPES, categoriesInStandardSeed } from './standard-types';

describe('standard-types', () => {
  it('covers all 7 categories', () => {
    expect(categoriesInStandardSeed()).toEqual(STANDARD_CATEGORIES);
    expect(STANDARD_DOCUMENT_TYPES.length).toBeGreaterThanOrEqual(10);
  });

  it('documentTypeCode is unique', () => {
    const codes = STANDARD_DOCUMENT_TYPES.map((t) => t.documentTypeCode);
    expect(new Set(codes).size).toBe(codes.length);
  });
});
