import { describe, expect, it } from 'vitest';
import { validateTemplateContent } from './validate-template-content';

describe('validateTemplateContent', () => {
  it('rejects unknown placeholder', () => {
    expect(validateTemplateContent('Hello {unknown_key}')).toBe('nt_invalid_placeholder');
  });

  it('accepts catalog placeholder', () => {
    expect(validateTemplateContent('Hello {kullanici_adi}')).toBeNull();
  });
});
