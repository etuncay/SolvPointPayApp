import { describe, expect, it } from 'vitest';
import { validateUploadFile } from './file-validation';

describe('file-validation', () => {
  it('rejects exe extension', () => {
    expect(
      validateUploadFile({
        fileName: 'virus.exe',
        mimeType: 'application/octet-stream',
        sizeBytes: 1000,
      }),
    ).toBe('du_invalid_extension');
  });

  it('rejects docm macro', () => {
    expect(
      validateUploadFile({
        fileName: 'macro.docm',
        mimeType: 'application/vnd.ms-word.document.macroEnabled.12',
        sizeBytes: 1000,
      }),
    ).toBe('du_invalid_extension');
  });

  it('rejects file over max size', () => {
    expect(
      validateUploadFile({
        fileName: 'big.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 11 * 1024 * 1024,
        maxSizeMb: 10,
      }),
    ).toBe('du_file_too_large');
  });

  it('accepts valid pdf', () => {
    expect(
      validateUploadFile({
        fileName: 'doc.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 1024,
      }),
    ).toBeNull();
  });
});
